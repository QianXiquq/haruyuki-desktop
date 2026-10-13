import type { StatusSummary } from "@/shared/ipc-contract";
import { formatTokens } from "@/shared/ipc-contract";

interface Props {
  summary: StatusSummary;
}

/** 状态条上的一项：文字 + 悬停说明。 */
interface Part {
  text: string;
  title?: string;
  /** 视觉上强调（目前只用于"本会话合计"）。 */
  strong?: boolean;
}

/**
 * 底部状态条。
 *
 * 形态参考 DeepSeek Harness 的界面：一条**低矮、低调**的横条，横向排开
 * 关键数字，用 `·` 分隔，不做卡片、不占视觉重量。
 *
 * ⚠️ 参考设计里有 `上下文 47%`，这里**只有绝对值** —— 那个百分比的分母
 * （上下文窗口上限）在协议上拿不到（见 `StatusSummary` 的说明）。宁缺勿编。
 */
export function StatusBar({ summary }: Props) {
  const s = summary;
  const parts: Part[] = [];

  if (s.state === "connected") {
    parts.push({ text: s.haruyukiVersion ? `haruyuki v${s.haruyukiVersion}` : "已连接" });
    if (s.protocolVersion) parts.push({ text: `protocol v${s.protocolVersion}` });
    if (s.backend) parts.push({ text: s.backend });
  } else {
    parts.push({
      text: s.state === "starting" ? "正在启动服务端…" : s.state === "error" ? "连接失败" : "已断开",
    });
  }

  /**
   * 主角：**本窗口（当前会话）所有轮**的 token 总和。
   *
   * ⚠️ 悬停说明必须写明口径 —— 历史消息没有用量（协议把
   * `assistant_message.usage` 丢掉了），所以打开旧会话时它从 0 开始攒。
   * 不说明的话，用户会以为这是这个会话一辈子的总消耗。
   */
  if (s.conversationTokens > 0) {
    parts.push({
      text: `本会话合计 ${formatTokens(s.conversationTokens)} tok`,
      strong: true,
      title:
        "本窗口（当前会话）所有轮的 token 合计（输入 + 输出）。\n" +
        "只统计本次运行产生的轮次：协议在历史消息里丢掉了 usage，所以打开旧会话时从 0 开始攒。",
    });
  }
  if (s.totalTokens > 0) {
    parts.push({
      text: `本次运行 ${formatTokens(s.totalTokens)} tok`,
      title: "本次运行（应用启动至今）的累计，跨会话；切换会话时会清零重攒。",
    });
  }
  if (s.contextTokens > 0) {
    parts.push({
      text: `上下文 ${s.contextTokens.toLocaleString()}`,
      title: "当前上下文规模（服务端报的 context_tokens），不是本轮用量。",
    });
  }
  if (s.cacheHitRate !== undefined) {
    parts.push({ text: `缓存命中 ${Math.round(s.cacheHitRate)}%` });
  }
  if (s.recallTurns > 0) {
    parts.push({ text: `召回 ${s.recallTurns} 轮` });
  }

  return (
    <footer className="statusbar">
      <span className={`statusbar-dot statusbar-dot-${s.state}`} aria-hidden="true" />
      <span className="statusbar-line">
        {parts.map((part, index) => (
          <span key={`${part.text}-${index}`}>
            {index > 0 ? <span className="statusbar-sep"> · </span> : null}
            <span className={part.strong ? "statusbar-strong" : undefined} title={part.title}>
              {part.text}
            </span>
          </span>
        ))}
      </span>
      {s.recallMissing > 0 ? (
        <span className="statusbar-warn" title="这些会话的召回是静默失效的：不会报错，只是永远召不回来">
          ⚠️ {s.recallMissing} 个会话未建索引
        </span>
      ) : null}
    </footer>
  );
}
