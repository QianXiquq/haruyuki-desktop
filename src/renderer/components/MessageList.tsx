import type { ChatItem } from "@/shared/ipc-contract";

interface Props {
  items: ChatItem[];
  /** 正在拉取历史消息。历史为空时不能直接说"还没有消息"——那是还没拉完。 */
  loading?: boolean;
}

function renderItem(item: ChatItem) {
  switch (item.kind) {
    case "user":
      return <div className="msg user">{item.text}</div>;
    case "assistant":
      return <div className="msg assistant">{item.text}</div>;
    case "reasoning":
      return <details className="msg reasoning"><summary>推理</summary><pre>{item.text}</pre></details>;
    case "tool_call":
      return (
        <div className="msg tool">
          <div className="tool-name">
            工具调用：{item.name} {item.done ? "✓" : "…"}
          </div>
          <pre>{typeof item.input === "string" ? item.input : JSON.stringify(item.input, null, 2)}</pre>
          {item.done && item.output ? <pre className="tool-output">{item.output}</pre> : null}
        </div>
      );
    case "notice":
      return <div className={`msg notice${item.level === "error" ? " notice-error" : ""}`}>{item.text}</div>;
    default:
      return null;
  }
}

export function MessageList({ items, loading = false }: Props) {
  return (
    <div className="message-list">
      {items.length === 0 ? (
        <div className="empty">
          {loading ? "正在加载历史消息…" : "还没有消息。选一个 agent，然后开始对话。"}
        </div>
      ) : null}
      {items.map((item) => (
        <div key={item.id}>{renderItem(item)}</div>
      ))}
    </div>
  );
}
