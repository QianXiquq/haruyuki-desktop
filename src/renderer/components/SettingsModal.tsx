import type { RecallSettingValue, RecallStatusSummary, ServerStatus, UsageStats, UsageTotals } from "@/shared/ipc-contract";
import { RecallPanel } from "./RecallPanel";

interface Props {
  recall: RecallStatusSummary | null;
  busy: boolean;
  dirty: boolean;
  restarting: boolean;
  status: ServerStatus;
  usageTotals: UsageTotals;
  lastUsage: UsageStats | null;
  /** 本会话全部 token（含磁盘历史）。 */
  conversationTokens: number;
  /** 历史基数的覆盖情况。 */
  conversationHistory: { turns: number; assistantMessages: number } | null;
  onRefresh: () => void;
  onBuild: () => void;
  onApply: (setting: RecallSettingValue) => void;
  onRestart: () => void;
  onProbe: (query: string) => Promise<{ ok: boolean; output: string; error?: string }>;
  onClose: () => void;
}

/**
 * 设置弹窗。
 *
 * ## 为什么把 recall 搬到这里
 *
 * 召回（recall）这块东西原先固定占着左侧栏**下半屏**，但它是**低频功能** ——
 * 设置一次就不再动，日常真正在用的是上面的会话列表。结果是低频内容长期挤占
 * 高频内容的竖向空间（左侧栏本来就只有 268px 宽）。
 *
 * 搬进弹窗后：左侧栏只留「新会话 / 记忆 / 搜索 / 会话列表」，这些才是天天点的。
 *
 * 搬家**不删任何功能** —— 召回状态、索引覆盖率、建索引、试搜、十项设置、
 * 重启服务端、本次运行用量，全在这里，只是不再常驻。
 */
export function SettingsModal({
  recall,
  busy,
  dirty,
  restarting,
  status,
  usageTotals,
  lastUsage,
  conversationTokens,
  conversationHistory,
  onRefresh,
  onBuild,
  onApply,
  onRestart,
  onProbe,
  onClose,
}: Props) {
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal settings-modal">
        <header className="modal-head">
          <span className="modal-title">设置</span>
          <span className="settings-sub">召回 · 用量</span>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              关闭
            </button>
          </div>
        </header>

        {/* 整块复用 RecallPanel —— 搬位置，不改行为，减少搬出 bug 的机会 */}
        <div className="settings-body">
          <RecallPanel
            recall={recall}
            busy={busy}
            dirty={dirty}
            restarting={restarting}
            status={status}
            usageTotals={usageTotals}
            lastUsage={lastUsage}
            conversationTokens={conversationTokens}
            conversationHistory={conversationHistory}
            onRefresh={onRefresh}
            onBuild={onBuild}
            onApply={onApply}
            onRestart={onRestart}
            onProbe={onProbe}
          />
        </div>
      </div>
    </div>
  );
}
