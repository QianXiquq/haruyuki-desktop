import type { StatusSummary } from "@/shared/ipc-contract";
import { formatTokens } from "@/shared/ipc-contract";

interface Props {
  summary: StatusSummary;
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
  const parts: string[] = [];

  if (s.state === "connected") {
    parts.push(s.haruyukiVersion ? `haruyuki v${s.haruyukiVersion}` : "已连接");
    if (s.protocolVersion) parts.push(`protocol v${s.protocolVersion}`);
    if (s.backend) parts.push(s.backend);
  } else {
    parts.push(s.state === "starting" ? "正在启动服务端…" : s.state === "error" ? "连接失败" : "已断开");
  }

  if (s.totalTokens > 0) parts.push(`本次累计 ${formatTokens(s.totalTokens)} tok`);
  if (s.contextTokens > 0) parts.push(`上下文 ${s.contextTokens.toLocaleString()}`);
  if (s.cacheHitRate !== undefined) parts.push(`缓存命中 ${Math.round(s.cacheHitRate)}%`);
  if (s.recallTurns > 0) parts.push(`召回 ${s.recallTurns} 轮`);

  return (
    <footer className="statusbar">
      <span className={`statusbar-dot statusbar-dot-${s.state}`} aria-hidden="true" />
      <span className="statusbar-line">{parts.join(" · ")}</span>
      {s.recallMissing > 0 ? (
        <span className="statusbar-warn" title="这些会话的召回是静默失效的：不会报错，只是永远召不回来">
          ⚠️ {s.recallMissing} 个会话未建索引
        </span>
      ) : null}
    </footer>
  );
}
