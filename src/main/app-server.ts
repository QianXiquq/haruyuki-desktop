import { AppServerClient } from "haruyuki/app-server-client";
import type { WsProtocolMessage } from "haruyuki/app-server-protocol";
import type { AgentSummary, HaruyukiEvent, RuntimeScope } from "@/shared/ipc-contract";

interface DeltaEnvelope {
  type?: string;
  delta?: { type?: string; [key: string]: unknown };
  [key: string]: unknown;
}

function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** 把服务端的原始帧收敛成 GUI 关心的少量事件。 */
export class AppServerBridge {
  private client: AppServerClient | null = null;

  constructor(private readonly emit: (event: HaruyukiEvent) => void) {}

  async connect(wsUrl: string, WebSocketImpl: unknown): Promise<number> {
    const client = new AppServerClient({
      url: wsUrl,
      WebSocket: WebSocketImpl as never,
    });
    this.client = client;

    client.onMessage((message: WsProtocolMessage) => this.handleMessage(message));
    client.onDisconnect(({ event }) => {
      this.emit({
        kind: "status",
        status: { state: "disconnected", wsUrl, error: String(event) },
      });
    });

    await client.connect();
    const info = await client.info();
    const protocolVersion = Number(
      (info as unknown as { protocol_version?: number }).protocol_version ?? 0,
    );
    this.emit({ kind: "status", status: { state: "connected", wsUrl, protocolVersion } });
    return protocolVersion;
  }

  get current(): AppServerClient {
    if (!this.client) throw new Error("尚未连接到 app-server");
    return this.client;
  }

  async listAgents(): Promise<AgentSummary[]> {
    const response = await this.current.request("agent_list", {});
    const agents = (response as unknown as { agents?: unknown[] }).agents ?? [];
    return agents.map((raw) => {
      const agent = raw as { id?: string; name?: string; description?: string };
      return {
        id: String(agent.id ?? ""),
        ...(agent.name ? { name: agent.name } : {}),
        ...(agent.description ? { description: agent.description } : {}),
      };
    });
  }

  async startRuntime(agentId: string): Promise<RuntimeScope> {
    const response = await this.current.runtimeStart({ agent_id: agentId });
    const runtime = (response as unknown as { runtime?: RuntimeScope }).runtime;
    if (!runtime) throw new Error("runtime_start 未返回 runtime scope");
    return runtime;
  }

  sendMessage(text: string): void {
    this.emit({ kind: "user_message", text });
    this.current.input({
      payload: {
        kind: "create_message",
        messages: [
          {
            role: "user",
            content: text,
            client_message_id: `gui-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          },
        ],
      },
    } as never);
  }

  respondApproval(requestId: string, decision: "allow" | "deny"): void {
    this.emit({ kind: "approval_resolved", requestId, decision });
    this.current.input({
      payload: { kind: "approval_response", request_id: requestId, decision },
    } as never);
  }

  async interrupt(): Promise<void> {
    await this.current.request("abort_message", {});
  }

  close(): void {
    try {
      this.client?.close();
    } catch {
      /* 忽略关闭异常 */
    }
    this.client = null;
  }

  private handleMessage(message: WsProtocolMessage): void {
    const frame = message as unknown as DeltaEnvelope & { type?: string };

    switch (frame.type) {
      case "stream_delta": {
        this.handleDelta(frame);
        return;
      }
      case "control_request": {
        const requestId = textOf(frame.request_id ?? frame.id);
        const request = (frame.request ?? {}) as { subtype?: string; tool_name?: string; input?: unknown };
        this.emit({
          kind: "approval_request",
          requestId,
          toolName: textOf(request.tool_name) || "unknown",
          input: request.input ?? null,
        });
        return;
      }
      case "turn_finished": {
        this.emit({ kind: "turn_finished", stopReason: textOf(frame.stop_reason) });
        return;
      }
      case "update_loop_status": {
        this.emit({ kind: "loop_status", status: textOf(frame.status ?? frame.loop_status) });
        return;
      }
      case "update_queue": {
        const queue = (frame.queue ?? []) as unknown[];
        this.emit({ kind: "queue", pending: queue.length });
        return;
      }
      default:
        return;
    }
  }

  private handleDelta(frame: DeltaEnvelope): void {
    const delta = frame.delta ?? {};
    const deltaType = textOf(delta.type);

    if (deltaType !== "message") return;

    const messageType = textOf(delta.message_type);
    switch (messageType) {
      case "assistant_message":
        this.emit({ kind: "assistant_delta", text: textOf(delta.content) });
        return;
      case "reasoning_message":
        this.emit({ kind: "reasoning_delta", text: textOf(delta.reasoning) || textOf(delta.content) });
        return;
      case "tool_call_message": {
        const toolCall = (delta.tool_call ?? {}) as { name?: string; arguments?: unknown };
        this.emit({
          kind: "tool_call",
          id: textOf(delta.id) || `tool-${Date.now()}`,
          name: textOf(toolCall.name) || "tool",
          input: toolCall.arguments ?? null,
        });
        return;
      }
      case "tool_return_message":
        this.emit({
          kind: "tool_return",
          id: textOf(delta.tool_call_id) || textOf(delta.id),
          output: textOf(delta.tool_return) || textOf(delta.content),
        });
        return;
      default:
        return;
    }
  }
}
