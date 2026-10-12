import { useEffect } from "react";
import type { RecallStatusSummary, ServerStatus } from "@/shared/ipc-contract";

interface Props {
  recall: RecallStatusSummary | null;
  busy: boolean;
  status: ServerStatus;
  onRefresh: () => void;
  onBuild: () => void;
}

/**
 * recall 面板（B0：只看状态 + 手动构建索引）。
 *
 * ## 这个面板为什么必须存在
 *
 * recall 是 haruyuki 的**被动**能力：每轮发送前服务端自动检索历史会话与 MemFS
 * 记忆文件，命中就注入到用户消息里。它在**协议层没有任何命令**。
 *
 * 问题在于：**索引为空时 recall 静默失效** —— 查询返回 `no-match` 走的是**正常路径**
 * 而**不是** degraded，因此**不发任何通知**。用户只会看到 "agent 没答上之前聊过的事"，
 * 没有任何线索指向 recall。而上游给出的唯一自救办法 `haruyuki recall build`
 * 是一条 **CLI/TUI 命令**，GUI 用户没有它就永远好不了。
 *
 * 所以这里的"构建索引"按钮不是锦上添花，它是**GUI 能自救的最低条件**。
 */
export function RecallPanel({ recall, busy, status, onRefresh, onBuild }: Props) {
  const connected = status.state === "connected";

  // 连上之后读一次状态。刻意不在每次回合后自动重读 —— 那会在每轮对话后多起一个
  // 子进程，而索引覆盖率并不会每轮都变。
  useEffect(() => {
    if (connected) onRefresh();
  }, [connected, onRefresh]);

  const missing = recall?.missing ?? 0;
  const neverIndexed = connected && recall !== null && missing > 0;

  return (
    <section className="recall-panel">
      <div className="recall-head">
        <span>召回（recall）</span>
        <button
          type="button"
          className="recall-refresh"
          disabled={!connected || busy}
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
              ⚠️ 有 {missing} 个会话还没有索引 ——{" "}
              <strong>这些会话的召回是静默失效的</strong>
              （不会报错，只是永远召不回来）。点下面的按钮构建。
            </div>
          ) : null}
        </>
      )}

      <button
        type="button"
        className="recall-build"
        disabled={!connected || busy}
        onClick={onBuild}
        // 刻意**不在满覆盖时禁用**：上游的 status 把 ready/stale/exempt 三类加起来
        // 算"已索引"，所以"22/22"不代表索引是新鲜的。禁用会挡住唯一的手动重建手段。
        title="运行 haruyuki recall build（写操作，会重建召回索引）"
      >
        {busy ? "构建中…" : "构建召回索引"}
      </button>
      <div className="recall-line muted small">
        build 是写操作，只在你点它时执行。已建好时重跑是幂等的。
      </div>
    </section>
  );
}
