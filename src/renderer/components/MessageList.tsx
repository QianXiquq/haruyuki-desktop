import type { ChatItem, UsageStats } from "@/shared/ipc-contract";
import { formatUsageDetail, formatUsageLine } from "@/shared/ipc-contract";

interface Props {
  items: ChatItem[];
  /** 正在拉取历史消息。历史为空时不能直接说"还没有消息"——那是还没拉完。 */
  loading?: boolean;
  /**
   * 每轮用量，按消息 id 索引。
   *
   * ⚠️ 历史消息里**没有**用量：协议在下发 `conversation_messages_list` 时把
   * `assistant_message.usage` 整段丢掉了（实测为 `null`），磁盘上其实有。
   * 所以只有**本次运行新产生的**回合才有这一行 —— 这是数据的限制，不是渲染漏了。
   */
  usageByItem?: Record<string, UsageStats>;
}

function UsageLine({ usage }: { usage: UsageStats }) {
  return (
    <div className="usage-line" title={formatUsageDetail(usage)}>
      {formatUsageLine(usage)}
    </div>
  );
}

function renderItem(item: ChatItem) {
  switch (item.kind) {
    case "user":
      return <div className="msg user">{item.text}</div>;
    case "assistant":
      // 参考设计的正文是"裸文本"，但纯裸文本会和 user 消息混成一团（实测看着确实分不清）。
      // 折中：**不画气泡**，只给一条左侧细线和一个小标签 —— 保留留白感，又能一眼分清角色。
      return (
        <div className="msg assistant">
          <span className="msg-role">agent</span>
          {item.text}
        </div>
      );
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

export function MessageList({ items, loading = false, usageByItem = {} }: Props) {
  return (
    <div className="message-list">
      {items.length === 0 ? (
        <div className="empty">
          {loading ? "正在加载历史消息…" : "还没有消息。选一个 agent，然后开始对话。"}
        </div>
      ) : null}
      {items.map((item) => (
        <div key={item.id}>
          {renderItem(item)}
          {item.kind === "assistant" && usageByItem[item.id] ? (
            <UsageLine usage={usageByItem[item.id] as UsageStats} />
          ) : null}
        </div>
      ))}
    </div>
  );
}
