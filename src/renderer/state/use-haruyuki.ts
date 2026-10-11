import { useCallback, useEffect, useState } from "react";
import type {
  AgentSummary,
  ChatItem,
  HaruyukiApi,
  RuntimeScope,
  ServerStatus,
} from "@/shared/ipc-contract";

declare global {
  interface Window {
    haruyuki: HaruyukiApi;
  }
}

export interface PendingApproval {
  requestId: string;
  toolName: string;
  input: unknown;
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function appendText(items: ChatItem[], kind: "assistant" | "reasoning", text: string): ChatItem[] {
  if (!text) return items;
  const last = items[items.length - 1];
  if (last && last.kind === kind) {
    const merged: ChatItem = { ...last, text: last.text + text };
    return [...items.slice(0, -1), merged];
  }
  return [...items, { id: uid(), kind, text }];
}

export function useHaruyuki() {
  const [status, setStatus] = useState<ServerStatus>({ state: "starting" });
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [busy, setBusy] = useState(false);
  const [runtime, setRuntime] = useState<RuntimeScope | null>(null);

  useEffect(() => {
    const offStatus = window.haruyuki.onStatus(setStatus);
    const offEvent = window.haruyuki.onEvent((event) => {
      switch (event.kind) {
        case "user_message":
          setItems((prev) => [...prev, { id: uid(), kind: "user", text: event.text }]);
          setBusy(true);
          return;
        case "assistant_delta":
          setItems((prev) => appendText(prev, "assistant", event.text));
          return;
        case "reasoning_delta":
          setItems((prev) => appendText(prev, "reasoning", event.text));
          return;
        case "tool_call":
          setItems((prev) => [
            ...prev,
            { id: event.id, kind: "tool_call", name: event.name, input: event.input, done: false },
          ]);
          return;
        case "tool_return":
          setItems((prev) =>
            prev.map((item) =>
              item.kind === "tool_call" && item.id === event.id
                ? { ...item, done: true, output: event.output }
                : item,
            ),
          );
          return;
        case "approval_request":
          setApprovals((prev) => [
            ...prev.filter((a) => a.requestId !== event.requestId),
            { requestId: event.requestId, toolName: event.toolName, input: event.input },
          ]);
          return;
        case "approval_resolved":
          setApprovals((prev) => prev.filter((a) => a.requestId !== event.requestId));
          return;
        case "turn_finished":
          setBusy(false);
          setApprovals([]);
          return;
        case "error":
          setItems((prev) => [...prev, { id: uid(), kind: "notice", text: `错误：${event.message}` }]);
          setBusy(false);
          return;
        default:
          return;
      }
    });
    return () => {
      offStatus();
      offEvent();
    };
  }, []);

  /** 统一把失败暴露到界面上，绝不静默吞掉。 */
  const guard = useCallback(async (label: string, fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setItems((prev) => [...prev, { id: uid(), kind: "notice", text: `${label}失败：${message}` }]);
    }
  }, []);

  const refreshAgents = useCallback(async () => {
    try {
      setAgents(await window.haruyuki.listAgents());
    } catch (error) {
      setItems((prev) => [
        ...prev,
        { id: uid(), kind: "notice", text: `无法列出 agent：${String(error)}` },
      ]);
    }
  }, []);

  const selectAgent = useCallback(
    async (agentId: string) => {
      await guard("连接 agent", async () => {
        const scope = await window.haruyuki.startRuntime(agentId);
        setRuntime(scope);
        setItems([]);
      });
    },
    [guard],
  );

  const send = useCallback(
    async (text: string) => {
      await guard("发送消息", async () => {
        await window.haruyuki.sendMessage(text);
      });
    },
    [guard],
  );

  const respond = useCallback(
    async (requestId: string, decision: "allow" | "deny") => {
      await guard("提交审批", async () => {
        await window.haruyuki.respondApproval(requestId, decision);
      });
    },
    [guard],
  );

  const interrupt = useCallback(
    async () => {
      await guard("中断", async () => {
        await window.haruyuki.interrupt();
      });
    },
    [guard],
  );

  return {
    status,
    agents,
    items,
    approvals,
    busy,
    runtime,
    refreshAgents,
    selectAgent,
    send,
    respond,
    interrupt,
  };
}
