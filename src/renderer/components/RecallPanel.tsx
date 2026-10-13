import { useEffect, useRef, useState } from "react";
import type {
  RecallDiversity,
  RecallDisplayTier,
  RecallSettingValue,
  RecallStatusSummary,
  ServerStatus,
  UsageStats,
  UsageTotals,
} from "@/shared/ipc-contract";
import { formatTokens } from "@/shared/ipc-contract";

interface Props {
  recall: RecallStatusSummary | null;
  busy: boolean;
  dirty: boolean;
  restarting: boolean;
  status: ServerStatus;
  onRefresh: () => void;
  onBuild: () => void;
  onApply: (setting: RecallSettingValue) => void;
  onRestart: () => void;
  usageTotals: UsageTotals;
  /** recall 试搜（搜正文与记忆）。 */
  onProbe: (query: string) => Promise<{ ok: boolean; output: string; error?: string }>;
  /** 最近一轮的用量（用于展示上下文规模）。 */
  lastUsage: UsageStats | null;
  /** **本会话全部** token（含磁盘历史）—— 只在「本会话（含历史）」那行用。 */
  conversationTokens: number;
  /** 历史基数的覆盖情况；null = 还没读到。 */
  conversationHistory: { turns: number; assistantMessages: number } | null;
}

/** 表单里的草稿值。全部按字符串存，避免数字输入框在编辑中途被强行转成数字。 */
interface Draft {
  timeout: string;
  dedup: string;
  limit: string;
  excerpt: string;
  charsPer: string;
  charsTotal: string;
  ratio: string;
  diversity: RecallDiversity;
  display: RecallDisplayTier;
}

const EMPTY: Draft = {
  timeout: "",
  dedup: "",
  limit: "",
  excerpt: "",
  charsPer: "",
  charsTotal: "",
  ratio: "",
  diversity: "none",
  display: "summary",
};

/**
 * ⚠️ `excerpt`（摘录**行数**）的当前值**无法从 status 反读**：实测改完 `excerpt 3`
 * 之后，`Settings:` 那行仍然只显示 `excerpt 400/1200 chars`（那是**字符**预算，
 * 不是行数）。所以这里只能留空并如实标注，不许假装知道。
 */
const EXCERPT_LINES_UNREADABLE =
  "「摘录行数」无法从 status 反读（上游只在 status 里报告字符预算，不报告行数）。留空 = 不改动。";

/**
 * recall 面板。
 *
 * ## 为什么"状态 + 建索引"是必需的（B0）
 *
 * recall 是**被动**能力：每轮发送前服务端自动检索历史会话与 MemFS 记忆文件，命中就注入。
 * 它在**协议层没有任何命令**。而**索引为空时 recall 静默失效** —— 查询返回 `no-match`
 * 走的是正常路径而**不是** degraded，因此**不发任何通知**。用户只看到 "agent 没答上
 * 以前聊过的事"。上游唯一的自救办法 `haruyuki recall build` 是 **TUI 命令**，
 * GUI 用户没有它就永远好不了。
 *
 * ## 为什么"设置 + 重启"是必需的（B1）
 *
 * `settingsManager` 在进程启动时读一次并缓存（`getSettings()` 直接
 * `return { ...this.settings }`），所以**改设置对已经在跑的服务端无效** ——
 * 必须换一个进程。所以改完要重启，而重启动作顺带把"窗口 reload 后状态卡死"也修了。
 */
export function RecallPanel({
  recall,
  busy,
  dirty,
  restarting,
  status,
  onRefresh,
  onBuild,
  onApply,
  onRestart,
  usageTotals,
  lastUsage,
  conversationTokens,
  conversationHistory,
  onProbe,
}: Props) {
  const connected = status.state === "connected";
  const [draft, setDraft] = useState<Draft>(EMPTY);
  /** 始终指向最新的 onRefresh —— 这样 effect 就不需要把它当依赖（见上面的说明）。 */
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;
  const [probeQuery, setProbeQuery] = useState("");
  const [probeResult, setProbeResult] = useState<string | null>(null);
  const [probing, setProbing] = useState(false);
  /** 用户正在编辑时不要用刷新回来的值覆盖他的输入。 */
  const editing = useRef(false);

  // ⚠️ **这里原本是一个无限循环，是"发消息就卡死"的根因**。
  //
  // 原写法 `useEffect(() => { if (connected) onRefresh(); }, [connected, onRefresh])`
  // 把 `onRefresh` 放进了依赖，而调用方（App）传的是**内联箭头函数**
  // `onRefresh={() => void refreshRecall()}` —— 每次渲染都是**新引用**，于是：
  //
  //   effect 触发 → refreshRecall() → setRecall(...) 改状态 → App 重渲染
  //   → 新的 onRefresh → effect 再次触发 → …（无限）
  //
  // 每轮都 spawn 一个 `haruyuki recall status` 子进程，而每个子进程要活到
  // **60 秒超时**才死 —— 实测堆积到 **187 个**子进程、负载冲到 **286**、
  // `kernel_task` 烧到 **257%**、macOS 触发 `spindump` 判定系统卡死。
  //
  // 发消息时 setItems 频繁重渲染，循环随之加速，所以症状表现为"一发消息就卡"。
  //
  // 修法：**只在连接状态真正变化时拉一次**，用 ref 记录是否已拉过，彻底断开依赖。
  const pulledForConnection = useRef(false);
  useEffect(() => {
    if (!connected) {
      pulledForConnection.current = false;
      return;
    }
    if (pulledForConnection.current) return;
    pulledForConnection.current = true;
    onRefreshRef.current();
  }, [connected]);

  useEffect(() => {
    if (!recall || editing.current) return;
    setDraft((prev) => ({
      ...prev,
      ...(recall.settings.timeoutMs !== undefined ? { timeout: String(recall.settings.timeoutMs) } : {}),
      ...(recall.settings.dedup !== undefined ? { dedup: String(recall.settings.dedup) } : {}),
      ...(recall.settings.limit !== undefined ? { limit: String(recall.settings.limit) } : {}),
      ...(recall.settings.excerptCharacters !== undefined
        ? { charsPer: String(recall.settings.excerptCharacters) }
        : {}),
      ...(recall.settings.totalCharacters !== undefined
        ? { charsTotal: String(recall.settings.totalCharacters) }
        : {}),
      ...(recall.settings.ratio !== undefined ? { ratio: String(recall.settings.ratio) } : {}),
      ...(recall.settings.diversity !== undefined ? { diversity: recall.settings.diversity } : {}),
      ...(recall.settings.display !== undefined ? { display: recall.settings.display } : {}),
    }));
  }, [recall]);

  const missing = recall?.missing ?? 0;
  const neverIndexed = connected && recall !== null && missing > 0;

  /** 读一个整数输入；空字符串表示"不改动"，返回 null。 */
  function intOrNull(raw: string, label: string): number | null {
    const text = raw.trim();
    if (text === "") return null;
    if (!/^\d+$/.test(text)) {
      throw new Error(`${label} 需要非负整数（收到「${text}」）`);
    }
    return Number(text);
  }

  function ratioOrNull(raw: string): number | null {
    const text = raw.trim();
    if (text === "") return null;
    const value = Number(text);
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`分数下限需要 0 到 1 之间（收到「${text}」）`);
    }
    return value;
  }

  /** 把草稿里**真正改过**的项逐个提交。空字段一律跳过 —— 不猜、不写默认值。 */
  function submit() {
    editing.current = false;
    const actions: RecallSettingValue[] = [];
    try {
      const timeout = intOrNull(draft.timeout, "超时");
      if (timeout !== null) actions.push({ knob: "timeout", value: timeout });
      const dedup = intOrNull(draft.dedup, "去重窗口");
      if (dedup !== null) actions.push({ knob: "dedup", value: dedup });
      const limit = intOrNull(draft.limit, "每轮条数");
      if (limit !== null) actions.push({ knob: "limit", value: limit });
      const excerpt = intOrNull(draft.excerpt, "摘录行数");
      if (excerpt !== null) actions.push({ knob: "excerpt", value: excerpt });
      const per = intOrNull(draft.charsPer, "单条字符预算");
      const total = intOrNull(draft.charsTotal, "总字符预算");
      // `chars` 上游要求两个数字一起给，所以只在两个都填了才提交。
      if (per !== null && total !== null) actions.push({ knob: "chars", value: { perEntry: per, total } });
      const ratio = ratioOrNull(draft.ratio);
      if (ratio !== null) actions.push({ knob: "ratio", value: ratio });
      actions.push({ knob: "diversity", value: draft.diversity });
      actions.push({ knob: "display", value: draft.display });
      for (const action of actions) onApply(action);
    } catch (error) {
      // 本地校验失败：不提交任何东西，让 onApply 之外的地方看到原因。
      window.alert(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <section className="recall-panel">
      <div className="recall-head">
        <span>全部对话搜索</span>
        <button
          type="button"
          className="recall-refresh"
          disabled={!connected || busy || restarting}
          title="重新读取 haruyuki recall status"
          onClick={onRefresh}
        >
          刷新
        </button>
      </div>

      {!connected ? (
        <div className="recall-line muted">等待连接…</div>
      ) : recall === null ? (
        <div className="recall-line muted">读取中…（haruyuki recall status）</div>
      ) : (
        <>
          <div className="recall-line">
            被动召回：<strong>{recall.enabled ? "已开启" : "已关闭"}</strong>
          </div>
          <div className="recall-line muted">{recall.indexLine || "（未报告索引状态）"}</div>
          {neverIndexed ? (
            <div className="recall-line warn">
              ⚠️ 有 {missing} 个会话还没有索引 —— <strong>这些会话的召回是静默失效的</strong>
              （不会报错，只是永远召不回来）。点下面的按钮构建。
            </div>
          ) : null}
        </>
      )}

      <div className="recall-line muted small">
        搜索<b>所有会话的正文</b>与<b>记忆文件</b>（recall）。侧栏那个框只搜会话<b>标题</b>，
        两者分工不同、都搜不到对方的东西。
      </div>

      <div className="recall-probe">
        <input
          type="text"
          className="recall-probe-input"
          value={probeQuery}
          disabled={busy || restarting || probing}
          placeholder="试搜正文/记忆…"
          title="运行 haruyuki recall now <查询>，只读取结果，不会改变下一轮注入"
          onChange={(e) => setProbeQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            setProbing(true);
            void onProbe(probeQuery)
              .then((r) => setProbeResult(r.ok ? r.output : `⚠️ ${r.error ?? "失败"}`))
              .finally(() => setProbing(false));
          }}
        />
        <button
          type="button"
          className="btn-soft"
          disabled={busy || restarting || probing || !probeQuery.trim()}
          onClick={() => {
            setProbing(true);
            void onProbe(probeQuery)
              .then((r) => setProbeResult(r.ok ? r.output : `⚠️ ${r.error ?? "失败"}`))
              .finally(() => setProbing(false));
          }}
        >
          {probing ? "搜索中…" : "试搜"}
        </button>
      </div>
      {probeResult ? <pre className="recall-probe-result">{probeResult}</pre> : null}

      <button
        type="button"
        className="recall-build"
        disabled={!connected || busy || restarting}
        onClick={onBuild}
        // 刻意**不在满覆盖时禁用**：上游把 ready/stale/exempt 三类加起来算"已索引"，
        // 所以"22/22"不代表索引是新鲜的。禁用会挡住唯一的手动重建手段。
        title="运行 haruyuki recall build（写操作，会重建召回索引）"
      >
        {busy ? "构建中…" : "构建召回索引"}
      </button>

      {/* ---------- 用量（C 项：只有 token，没有成本）---------- */}
      <div className="usage-panel">
        {/*
          ⚠️ 这里要分清两个口径：
          - 「本会话（含历史）」= 磁盘上的历史 + 本次运行新增 —— 打开旧会话直接就有总量
          - 「本次运行」= 应用启动至今，跨会话
          混在一起会让人以为打开旧会话时用量是空的（协议不下发历史 usage）。
        */}
        <div className="usage-head">用量</div>
        <div className="usage-total">
          本会话（含历史）{formatTokens(conversationTokens)} tokens
        </div>
        {conversationHistory && conversationHistory.assistantMessages > 0 ? (
          <div className="recall-line muted small">
            历史全量：{conversationHistory.turns}/{conversationHistory.assistantMessages} 轮有用量记录
            {conversationHistory.turns < conversationHistory.assistantMessages ? "（有轮次缺记录）" : ""}
          </div>
        ) : null}
        <div className="usage-head" style={{ marginTop: 8 }}>本次运行新增</div>
        {usageTotals.turns === 0 ? (
          <div className="recall-line muted small" title="本次运行还没有新产生的轮次">
            本次运行还没有新用量
          </div>
        ) : (
          <>
            <div className="usage-total">
              {usageTotals.turns} 轮 · 累计 {formatTokens(usageTotals.promptTokens + usageTotals.completionTokens)} tokens
            </div>
            <div className="recall-line muted small">
              prompt {formatTokens(usageTotals.promptTokens)} · completion{" "}
              {formatTokens(usageTotals.completionTokens)}（含推理 {formatTokens(usageTotals.reasoningTokens)}）
            </div>
            {lastUsage ? (
              <div className="recall-line muted small">
                当前上下文规模 {lastUsage.contextTokens.toLocaleString()}
              </div>
            ) : null}
          </>
        )}
        <div className="recall-line muted small" title="服务端不通过协议下发成本，本 GUI 也不做估算">
          只有 token，无成本（协议不下发）
        </div>
      </div>

      {/* ---------- 设置（B1）---------- */}
      <details className="recall-settings">
        <summary>设置（{connected && recall?.enabled ? "已开启" : "已关闭"}）</summary>

        <label className="recall-field">
          <span>开关</span>
          <button
            type="button"
            className="recall-toggle"
            disabled={!connected || busy || restarting}
            onClick={() => onApply({ knob: "enabled", value: !(recall?.enabled ?? false) })}
          >
            {recall?.enabled ? "关闭召回" : "开启召回"}
          </button>
        </label>
        <div className="recall-line muted small" title="重新开启会清除断路器（跳闸后唯一的人工恢复手段）">
          开启时会清除断路器
        </div>

        <label className="recall-field">
          <span>超时 ms</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="不改"
            value={draft.timeout}
            disabled={!connected || busy || restarting}
            onChange={(e) => { editing.current = true; setDraft((d) => ({ ...d, timeout: e.target.value })); }}
          />
        </label>
        <label className="recall-field">
          <span>去重轮数</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="不改"
            value={draft.dedup}
            disabled={!connected || busy || restarting}
            onChange={(e) => { editing.current = true; setDraft((d) => ({ ...d, dedup: e.target.value })); }}
          />
        </label>
        <label className="recall-field">
          <span>每轮条数</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="不改"
            value={draft.limit}
            disabled={!connected || busy || restarting}
            onChange={(e) => { editing.current = true; setDraft((d) => ({ ...d, limit: e.target.value })); }}
          />
        </label>
        <label className="recall-field">
          <span>摘录行数</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="不改"
            value={draft.excerpt}
            disabled={!connected || busy || restarting}
            onChange={(e) => { editing.current = true; setDraft((d) => ({ ...d, excerpt: e.target.value })); }}
          />
        </label>
        <div className="recall-line muted small" title={EXCERPT_LINES_UNREADABLE}>
          摘录行数无法从 status 反读
        </div>

        <label className="recall-field">
          <span>字符预算</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="单条"
            value={draft.charsPer}
            disabled={!connected || busy || restarting}
            onChange={(e) => { editing.current = true; setDraft((d) => ({ ...d, charsPer: e.target.value })); }}
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="总"
            value={draft.charsTotal}
            disabled={!connected || busy || restarting}
            onChange={(e) => { editing.current = true; setDraft((d) => ({ ...d, charsTotal: e.target.value })); }}
          />
        </label>
        <div className="recall-line muted small">两个都要填才提交</div>

        <label className="recall-field">
          <span>分数下限</span>
          <input
            type="text"
            placeholder="0–1"
            value={draft.ratio}
            disabled={!connected || busy || restarting}
            onChange={(e) => { editing.current = true; setDraft((d) => ({ ...d, ratio: e.target.value })); }}
          />
        </label>
        <label className="recall-field">
          <span>多样性</span>
          <select
            value={draft.diversity}
            disabled={!connected || busy || restarting}
            onChange={(e) => { editing.current = true; setDraft((d) => ({ ...d, diversity: e.target.value as RecallDiversity })); }}
          >
            <option value="none">none</option>
            <option value="file">file</option>
            <option value="split">split</option>
          </select>
        </label>
        <label className="recall-field">
          <span>显示档位</span>
          <select
            value={draft.display}
            disabled={!connected || busy || restarting}
            onChange={(e) => { editing.current = true; setDraft((d) => ({ ...d, display: e.target.value as RecallDisplayTier })); }}
          >
            <option value="silent">silent（不显示）</option>
            <option value="summary">summary（一行摘要）</option>
            <option value="full">full</option>
          </select>
        </label>

        <button type="button" className="recall-apply" disabled={!connected || busy || restarting} onClick={submit}>
          提交改动
        </button>
        <div className="recall-line muted small" title="本 GUI 一律剥掉注入块（等价于 silent），所以此项只影响你在 TUI 里的观感">
          「显示档位」只影响 TUI 观感
        </div>
      </details>

      {dirty ? (
        <div className="recall-line warn">
          ⚠️ 设置有改动但<strong>尚未生效</strong> —— 服务端在启动时才读一次设置。
          <button type="button" className="recall-restart" disabled={restarting} onClick={onRestart}>
            {restarting ? "重启中…" : "重启服务端使其生效"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="recall-restart idle"
          disabled={!connected || restarting}
          title="重启 app-server（也可用于从“界面卡在正在启动”中自救）"
          onClick={onRestart}
        >
          {restarting ? "重启中…" : "重启服务端"}
        </button>
      )}
    </section>
  );
}
