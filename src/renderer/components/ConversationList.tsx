import { useState } from "react";
import type { ConversationSummary } from "@/shared/ipc-contract";

interface Props {
  conversations: ConversationSummary[];
  activeId: string | null;
  disabled: boolean;
  onSelect: (conversationId: string) => void;
  /** 改名。传空字符串 = 清除自定义标题（退回自动推导）。 */
  onRename: (conversationId: string, summary: string) => Promise<void>;
}

/**
 * 会话列表里的一行标题。
 *
 * 服务端不提供标题，标题由主进程从最早的真实用户发言推导。推不出来时分两种：
 * 还没说过话的空会话，和取标题失败（消息页拉取失败）的会话 —— 后者必须区别对待，
 * 否则会谎称一个装满消息的会话是"空"。
 */
function labelOf(conversation: ConversationSummary): string {
  // 自定义标题（summary）优先 —— 那是用户自己写的。
  if (conversation.summary) return conversation.summary;
  if (conversation.title) return conversation.title;
  return conversation.messageCount === 0 ? "（空会话）" : "（无标题）";
}

function timeOf(conversation: ConversationSummary): string {
  const raw = conversation.lastMessageAt ?? conversation.createdAt;
  if (!raw) return "";
  const at = new Date(raw);
  if (Number.isNaN(at.getTime())) return "";
  return at.toLocaleString(undefined, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ConversationList({ conversations, activeId, disabled, onSelect, onRename }: Props) {
  /** 正在改名的那条。改名是**逐条**的，所以只需要一个 id。 */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 去掉 Electron 给 IPC 错误加的 `Error invoking remote method '…'` 包装。 */
  function clean(e: unknown): string {
    const raw = e instanceof Error ? e.message : String(e);
    return raw.replace(/^Error invoking remote method '[^']*':\s*(Error:\s*)?/, "").trim() || raw;
  }

  async function submitRename(conversationId: string): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await onRename(conversationId, draft);
      setEditingId(null);
    } catch (e) {
      setError(clean(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="conversation-list">
        {conversations.length === 0 ? (
          <div className="sidebar-empty">{disabled ? "等待连接…" : "还没有会话"}</div>
        ) : null}
        {conversations.map((conversation) => {
          const active = conversation.id === activeId;
          if (editingId === conversation.id) {
            return (
              <div key={conversation.id} className="conversation-rename">
                <input
                  type="text"
                  className="rename-input"
                  autoFocus
                  value={draft}
                  disabled={busy}
                  placeholder="自定义标题（留空 = 清除）"
                  title="改的是会话的 summary 字段：它既是界面标题，也是服务端搜索会话时会匹配的内容"
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void submitRename(conversation.id);
                    if (e.key === "Escape") { setEditingId(null); setError(null); }
                  }}
                />
                <div className="rename-actions">
                  <button type="button" className="btn-soft" disabled={busy} onClick={() => void submitRename(conversation.id)}>
                    {busy ? "…" : "保存"}
                  </button>
                  <button type="button" disabled={busy} onClick={() => { setEditingId(null); setError(null); }}>
                    取消
                  </button>
                </div>
                {error ? <div className="rename-error">⚠️ {error}</div> : null}
              </div>
            );
          }
          return (
            <div key={conversation.id} className={`conversation-row${active ? " active" : ""}`}>
              <button
                type="button"
                className={`conversation${active ? " active" : ""}`}
                disabled={disabled}
                title={`${conversation.id} · ${conversation.messageCount} 条消息`}
                onClick={() => onSelect(conversation.id)}
              >
                <span className="conversation-title">{labelOf(conversation)}</span>
                <span className="conversation-meta">
                  {timeOf(conversation)}
                  {conversation.messageCount > 0 ? ` · ${conversation.messageCount} 条` : ""}
                </span>
              </button>
              <button
                type="button"
                className="rename-trigger"
                disabled={disabled}
                title={conversation.summary ? `改名（当前自定义标题：${conversation.summary}）` : "给这个会话起个名字"}
                onClick={() => {
                  setDraft(conversation.summary ?? "");
                  setError(null);
                  setEditingId(conversation.id);
                }}
              >
                ✎
              </button>
            </div>
          );
        })}
    </div>
  );
}
