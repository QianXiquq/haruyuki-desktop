import { AppServerClient } from "haruyuki/app-server-client";
import type { WsProtocolCommand, WsProtocolMessage } from "haruyuki/app-server-protocol";
import type { AgentSummary, HaruyukiEvent, RuntimeScope } from "@/shared/ipc-contract";

type Frame = Record<string, unknown> & { type?: string };

/**
 * 从协议字段里取文本。
 *
 * ⚠️ 关键：`assistant_message.content` 是**数组** `[{ type: "text", text: "…" }]`，
 * 不是字符串。当成字符串取会得到空串，正文就渲染成一片空白 —— 这是实测抓到的 bug。
 */
export function extractText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  let out = "";
  for (const part of value) {
    if (part && typeof part === "object") {
      const text = (part as { text?: unknown }).text;
      if (typeof text === "string") out += text;
    }
  }
  return out;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

/** 把服务端的原始帧收敛成 GUI 关心的少量事件。 */
export class AppServerBridge {
  private client: AppServerClient | null = null;

  /**
   * `runtime_start` 解析出的作用域。
   *
   * ⚠️ `InputCommand.runtime` 是**必填**字段（见 src/types/protocol_v2.ts:650-656）。
   * 缺了它，消息不会被当成有效输入处理 —— 这是实测抓到的第二个 bug。
   */
  private runtime: RuntimeScope | null = null;

  constructor(private readonly emit: (event: HaruyukiEvent) => void) {}

  async connect(wsUrl: string, WebSocketImpl: unknown): Promise<number> {
    const client = new AppServerClient({ url: wsUrl, WebSocket: WebSocketImpl as never });
    this.client = client;

    client.onMessage((message: WsProtocolMessage) => this.handleMessage(message));
    client.onDisconnect(({ event }) => {
      this.emit({ kind: "status", status: { state: "disconnected", wsUrl, error: String(event) } });
    });

    await client.connect();
    const info = (await client.info()) as unknown as { protocol_version?: number };
    const protocolVersion = Number(info.protocol_version ?? 0);
    this.emit({ kind: "status", status: { state: "connected", wsUrl, protocolVersion } });
    return protocolVersion;
  }

  get current(): AppServerClient {
    if (!this.client) throw new Error("尚未连接到 app-server");
    return this.client;
  }

  private requireRuntime(): RuntimeScope {
    if (!this.runtime) throw new Error("尚未 runtime_start，无法发送消息");
    return this.runtime;
  }

  async listAgents(): Promise<AgentSummary[]> {
    const response = (await this.current.request("agent_list", {})) as unknown as {
      agents?: unknown[];
    };
    return (response.agents ?? []).map((raw) => {
      const agent = asRecord(raw);
      return {
        id: str(agent.id),
        ...(str(agent.name) ? { name: str(agent.name) } : {}),
        ...(str(agent.description) ? { description: str(agent.description) } : {}),
      };
    });
  }

  async startRuntime(agentId: string): Promise<RuntimeScope> {
    const response = await this.current.runtimeStart({ agent_id: agentId });
    const frame = response as unknown as {
      success?: boolean;
      runtime?: RuntimeScope | null;
      error?: string;
    };
    if (frame.success === false || !frame.runtime) {
      // 不允许静默失败：把服务端的真实原因抛给渲染进程显示出来。
      throw new Error(frame.error ? `runtime_start 失败：${frame.error}` : "runtime_start 未返回 runtime scope");
    }
    this.runtime = frame.runtime;
    return frame.runtime;
  }

  sendMessage(text: string): void {
    const runtime = this.requireRuntime();
    this.emit({ kind: "user_message", text });
    this.current.send(this.buildInput(runtime, {
      kind: "create_message",
      messages: [
        {
          role: "user",
          content: text,
          client_message_id: `gui-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        },
      ],
    }));
  }

  respondApproval(requestId: string, decision: "allow" | "deny"): void {
    const runtime = this.requireRuntime();
    this.emit({ kind: "approval_resolved", requestId, decision });
    this.current.send(this.buildInput(runtime, {
      kind: "approval_response",
      request_id: requestId,
      decision,
    }));
  }

  async interrupt(): Promise<void> {
    this.current.send({
      type: "abort_message",
      runtime: this.requireRuntime(),
    } as unknown as WsProtocolCommand);
  }

  close(): void {
    try {
      this.client?.close();
    } catch {
      /* 忽略关闭异常 */
    }
    this.client = null;
    this.runtime = null;
  }

  /**
   * 唯一的形状转换点。
   *
   * `MessageCreate` 来自 `@letta-ai/letta-client` 的线上类型，字段面比这里用到的宽；
   * 这里做一次集中的、有注释的断言，而不是在每个调用点撒 `as never`。
   */
  private buildInput(runtime: RuntimeScope, payload: Record<string, unknown>): WsProtocolCommand {
    return { type: "input", runtime, payload } as unknown as WsProtocolCommand;
  }

  private handleMessage(message: WsProtocolMessage): void {
    const frame = message as unknown as Frame;

    switch (frame.type) {
      case "stream_delta":
        this.handleDelta(asRecord(frame.delta));
        return;
      case "control_request": {
        const request = asRecord(frame.request);
        this.emit({
          kind: "approval_request",
          requestId: str(frame.request_id) || str(frame.id),
          toolName: str(request.tool_name) || "unknown",
          input: request.input ?? null,
        });
        return;
      }
      case "turn_finished": {
        const stopReason = str(frame.stop_reason);
        const error = str(frame.error);
        this.emit({
          kind: "turn_finished",
          ...(stopReason ? { stopReason } : {}),
        });
        if (error) this.emit({ kind: "error", message: error });
        return;
      }
      case "update_loop_status": {
        this.emit({ kind: "loop_status", status: str(asRecord(frame.loop_status).status) });
        return;
      }
      case "update_queue": {
        this.emit({ kind: "queue", pending: (frame.queue as unknown[] | undefined)?.length ?? 0 });
        return;
      }
      default:
        return;
    }
  }

  private handleDelta(delta: Record<string, unknown>): void {
    if (str(delta.type) !== "message") return;

    switch (str(delta.message_type)) {
      case "assistant_message":
        this.emit({ kind: "assistant_delta", text: extractText(delta.content) });
        return;
      case "reasoning_message":
        this.emit({ kind: "reasoning_delta", text: str(delta.reasoning) || extractText(delta.content) });
        return;
      case "tool_call_message": {
        const toolCall = asRecord(delta.tool_call);
        this.emit({
          kind: "tool_call",
          id: str(delta.id) || `tool-${Date.now()}`,
          name: str(toolCall.name) || "tool",
          input: toolCall.arguments ?? null,
        });
        return;
      }
      case "tool_return_message":
        this.emit({
          kind: "tool_return",
          id: str(delta.tool_call_id) || str(delta.id),
          output: str(delta.tool_return) || extractText(delta.content),
        });
        return;
      case "loop_error":
        this.emit({ kind: "error", message: str(delta.message) || "回合出错" });
        return;
      default:
        return;
    }
  }
}
