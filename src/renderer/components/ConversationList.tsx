import type { ConversationSummary } from "@/shared/ipc-contract";

interface Props {
  conversations: ConversationSummary[];
  activeId: string | null;
  disabled: boolean;
  onSelect: (conversationId: string) => void;
  onCreate: () => void;
}

/**
 * 会话列表里的一行标题。
 *
 * 服务端不提供标题，标题由主进程从最早的真实用户发言推导。推不出来时分两种：
 * 还没说过话的空会话，和取标题失败（消息页拉取失败）的会话 —— 后者必须区别对待，
 * 否则会谎称一个装满消息的会话是"空"。
 */
function labelOf(conversation: ConversationSummary): string {
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

export function ConversationList({ conversations, activeId, disabled, onSelect, onCreate }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <span>会话</span>
        <button type="button" className="new-conversation" disabled={disabled} onClick={onCreate}>
          + 新建
        </button>
      </div>
      <div className="conversation-list">
        {conversations.length === 0 ? (
          <div className="sidebar-empty">{disabled ? "等待连接…" : "还没有会话"}</div>
        ) : null}
        {conversations.map((conversation) => {
          const active = conversation.id === activeId;
          return (
            <button
              type="button"
              key={conversation.id}
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
          );
        })}
      </div>
    </aside>
  );
}
