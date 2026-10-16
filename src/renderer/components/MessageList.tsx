import { memo } from "react";
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
  /**
   * 是否正在生成。
   *
   * 只用来给"思考"折叠加一个进行中的提示 —— 折叠内容默认收起，没有这个提示的话，
   * 流式期间界面看起来像卡住了（用户看不到任何变化）。
   */
  busy?: boolean;
}

function UsageLine({ usage }: { usage: UsageStats }) {
  return (
    <div className="usage-line" title={formatUsageDetail(usage)}>
      {formatUsageLine(usage)}
    </div>
  );
}

/** 折叠之外正常显示的条目。 */
type VisibleItem = Extract<ChatItem, { kind: "user" | "assistant" | "notice" }>;
/** 会被收进"思考"折叠的条目。 */
type ProcessItem = Extract<ChatItem, { kind: "reasoning" | "tool_call" }>;

function isProcessItem(item: ChatItem): item is ProcessItem {
  return item.kind === "reasoning" || item.kind === "tool_call";
}

/** 工具入参可能是字符串、对象，也可能是 undefined —— 统一成可读文本。 */
function formatToolInput(input: unknown): string {
  if (typeof input === "string") return input;
  if (input === undefined || input === null) return "";
  try {
    return JSON.stringify(input, null, 2) ?? String(input);
  } catch {
    // 循环引用之类的极端情况：宁可退化成 String，也不要让整棵消息树崩掉
    return String(input);
  }
}

function renderVisible(item: VisibleItem) {
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
    case "notice":
      return (
        <div className={`msg notice${item.level === "error" ? " notice-error" : ""}`}>{item.text}</div>
      );
  }
}

/**
 * 折叠里的一条"过程"：一段推理，或一次工具调用。
 *
 * 刻意**不再嵌套折叠**（推理原先自己是一个 `<details>`）—— 外面已经是一个大折叠了，
 * 再套一层要点两次才能看到内容。
 */
function ProcessBlock({ item }: { item: ProcessItem }) {
  if (item.kind === "reasoning") {
    return (
      <div className="thinking-step">
        <div className="thinking-label">推理</div>
        <pre className="thinking-text">{item.text}</pre>
      </div>
    );
  }
  return (
    <div className="thinking-step">
      <div className="thinking-label">
        工具调用：{item.name} {item.done ? "✓" : "…"}
      </div>
      <pre className="thinking-text">{formatToolInput(item.input)}</pre>
      {item.done && item.output ? <pre className="thinking-text tool-output">{item.output}</pre> : null}
    </div>
  );
}

/**
 * 一轮对话。
 *
 * 一轮 = 一条 user 消息 →（推理 / 工具调用 / assistant 正文 / notice）→ 下一条 user 消息之前。
 *
 * 为什么要在渲染层分组：底层收到的是**扁平的条目流**，一轮里推理与工具调用会交错出现很多次
 * （实际见过一轮 200+ 条）。不归拢就会渲染成一堆零散的小折叠，而那正是这次要改掉的显示效果。
 */
interface Turn {
  /** 稳定 key：用这轮 user 消息的 id，保证折叠的展开状态在流式重渲染时不被重置。 */
  key: string;
  user?: VisibleItem;
  /** 收进折叠的：推理 + 工具调用，保持原顺序。 */
  process: ProcessItem[];
  /** 折叠之外正常显示的：assistant 正文、notice。 */
  visible: VisibleItem[];
}

function groupIntoTurns(items: ChatItem[]): { leading: ChatItem[]; turns: Turn[] } {
  const leading: ChatItem[] = [];
  const turns: Turn[] = [];
  let current: Turn | null = null;

  for (const item of items) {
    if (item.kind === "user") {
      current = { key: item.id, user: item, process: [], visible: [] };
      turns.push(current);
      continue;
    }
    if (!current) {
      // 第一条 user 之前的条目（例如启动提示）：没有"轮"可归属，原样显示在最上面
      leading.push(item);
      continue;
    }
    if (isProcessItem(item)) current.process.push(item);
    else current.visible.push(item);
  }

  return { leading, turns };
}

/** 折叠标题。只报"有多少"，不泄露内容 —— 内容要点击才展开。 */
function summarize(process: ProcessItem[], running: boolean): string {
  const reasoning = process.filter((p) => p.kind === "reasoning").length;
  const tools = process.filter((p) => p.kind === "tool_call").length;
  const parts: string[] = [];
  if (reasoning > 0) parts.push(`${reasoning} 段推理`);
  if (tools > 0) parts.push(`${tools} 次工具调用`);
  const body = parts.join(" · ") || "无内容";
  return running ? `思考中…（${body}）` : `思考过程 · ${body}`;
}

/**
 * 单行消息，做了 `memo`。
 *
 * ⚠️ 这是性能修复的一半：流式期间 `items` 数组的**引用**每次都变（新数组），
 * 不 memo 的话每条历史消息都会跟着重建 DOM —— 长会话下这就是"卡死"的放大器。
 * memo 之后只有内容真正变化的那一行会重渲染。
 */
const MessageRow = memo(function MessageRow({
  item,
  usage,
}: {
  item: VisibleItem;
  usage?: UsageStats;
}) {
  return (
    <>
      {renderVisible(item)}
      {item.kind === "assistant" && usage ? <UsageLine usage={usage} /> : null}
    </>
  );
});

export function MessageList({ items, loading = false, usageByItem = {}, busy = false }: Props) {
  const { leading, turns } = groupIntoTurns(items);
  const lastTurn = turns.length > 0 ? turns[turns.length - 1] : undefined;

  return (
    <div className="message-list">
      {items.length === 0 ? (
        <div className="empty">
          {loading ? "正在加载历史消息…" : "还没有消息。选一个 agent，然后开始对话。"}
        </div>
      ) : null}

      {leading.map((item) => (
        <MessageRow key={item.id} item={item as VisibleItem} usage={usageByItem[item.id]} />
      ))}

      {turns.map((turn) => (
        <div className="turn" key={turn.key}>
          {turn.user ? <MessageRow item={turn.user} /> : null}

          {/*
            一轮里所有推理与工具调用收进**同一个**折叠，默认收起。
            折叠位置固定在这一轮的开头 —— 于是视觉上就是"发一段文字 → 一个思考折叠 → 最终输出"。
          */}
          {turn.process.length > 0 ? (
            <details className="msg thinking">
              <summary>{summarize(turn.process, busy && turn === lastTurn)}</summary>
              <div className="thinking-body">
                {turn.process.map((item) => (
                  <ProcessBlock key={item.id} item={item} />
                ))}
              </div>
            </details>
          ) : null}

          {turn.visible.map((item) => (
            <MessageRow key={item.id} item={item} usage={usageByItem[item.id]} />
          ))}
        </div>
      ))}
    </div>
  );
}
