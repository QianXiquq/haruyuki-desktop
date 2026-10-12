import { useEffect, useState } from "react";
import type { MemoryCommit, MemorySnapshot } from "@/shared/ipc-contract";

interface Props {
  memory: MemorySnapshot | null;
  busy: boolean;
  onClose: () => void;
  onRefresh: () => Promise<MemorySnapshot | null>;
  /** 读**原始**内容（含 frontmatter）—— 编辑必须基于它。 */
  onLoad: (path: string) => Promise<string>;
  onSave: (path: string, content: string, commitMessage?: string) => Promise<void>;
  onDelete: (path: string, commitMessage?: string) => Promise<void>;
  onHistory: (path?: string) => Promise<MemoryCommit[]>;
}

/** 去掉 Electron 给 IPC 错误加的包装。 */
function clean(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  return raw.replace(/^Error invoking remote method '[^']*':\s*(Error:\s*)?/, "").trim() || raw;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/**
 * 记忆浏览器（`/memory` 的 GUI 对应）。
 *
 * ## 为什么这个功能重要（而不是"又一个面板"）
 *
 * 记忆是 haruyuki 区别于普通 chat 客户端的**核心**：跨会话持久化的 MemFS。
 * 用得越久它越值钱 —— 而在此之前 GUI **完全看不见它、也改不了它**，这是 TUI 里
 * 唯一没有任何替代路径的功能（搜索至少有 recall 顶着）。
 *
 * ## 为什么用模态而不是塞进侧栏
 *
 * 它需要**竖向空间**放"文件列表 + 正文 + 历史"，塞进 268px 的侧栏只会变成一坨。
 *
 * ## 写入是安全的
 *
 * `write_memory_file` 每次写入都是**一次 git 提交**，所以写错能靠历史找回。
 * 服务端还会拒绝逃逸出记忆根的路径 —— 我们**不自己拼路径**，只透传，
 * 免得自制的校验与服务端不一致、反而给出错误的安全感。
 */
export function MemoryBrowser({ memory, busy, onClose, onRefresh, onLoad, onSave, onDelete, onHistory }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [history, setHistory] = useState<MemoryCommit[] | null>(null);
  /** 原始内容（含 frontmatter）。列表里的 content 是被剥过的，不能用。 */
  const [raw, setRaw] = useState<string | null>(null);
  const [loadingRaw, setLoadingRaw] = useState(false);

  // 打开时拉一次列表
  useEffect(() => {
    void onRefresh().catch((e: unknown) => setError(clean(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const files = memory?.files ?? [];
  const current = files.find((f) => f.path === selected) ?? null;

  // 选中文件时读**原始**内容（含 frontmatter）作为编辑基准
  useEffect(() => {
    if (!current) return;
    let cancelled = false;
    setEditing(false);
    setCommitMessage("");
    setHistory(null);
    setError(null);
    setRaw(null);
    setLoadingRaw(true);
    void onLoad(current.path)
      .then((text) => {
        if (cancelled) return;
        setRaw(text);
        setDraft(text);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(clean(e));
      })
      .finally(() => {
        if (!cancelled) setLoadingRaw(false);
      });
    return () => {
      cancelled = true;
    };
  }, [current?.path]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = raw !== null && draft !== raw;

  async function save(): Promise<void> {
    if (!current) return;
    setWorking(true);
    setError(null);
    try {
      await onSave(current.path, draft, commitMessage || undefined);
      setEditing(false);
      setCommitMessage("");
    } catch (e) {
      setError(clean(e));
    } finally {
      setWorking(false);
    }
  }

  async function remove(): Promise<void> {
    if (!current) return;
    // 删除不可逆（虽然 git 历史里还在），所以要确认。
    if (!window.confirm(`删除记忆文件 ${current.path}？\n\n（改动会作为一次提交留在历史里，可以用「历史」找回）`)) {
      return;
    }
    setWorking(true);
    setError(null);
    try {
      await onDelete(current.path, commitMessage || undefined);
      setSelected(null);
    } catch (e) {
      setError(clean(e));
    } finally {
      setWorking(false);
    }
  }

  async function showHistory(path?: string): Promise<void> {
    setWorking(true);
    setError(null);
    try {
      setHistory(await onHistory(path));
    } catch (e) {
      setError(clean(e));
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal memory-modal">
        <header className="modal-head">
          <span className="modal-title">记忆（MemFS）</span>
          {memory ? (
            <span className={`memory-memfs ${memory.memfsEnabled ? "on" : "off"}`}>
              {memory.memfsEnabled ? (memory.memfsInitialized ? "MemFS 已启用" : "MemFS 启用但未初始化") : "MemFS 未启用"}
            </span>
          ) : null}
          <span className="memory-count">{files.length} 个文件</span>
          <div className="modal-actions">
            <button type="button" className="btn-soft" disabled={working || busy} onClick={() => void onRefresh().catch((e: unknown) => setError(clean(e)))}>
              刷新
            </button>
            <button type="button" className="btn-soft" disabled={working} onClick={() => void showHistory()}>
              全部历史
            </button>
            <button type="button" onClick={onClose}>关闭</button>
          </div>
        </header>

        {!memory?.memfsEnabled ? (
          <div className="memory-warn">
            ⚠️ MemFS 显示为**未启用** —— 此时记忆可能走的是另一套存储，下面这份列表未必完整。
          </div>
        ) : null}

        <div className="memory-body">
          <nav className="memory-list">
            {files.length === 0 ? (
              <div className="memory-empty">{busy ? "读取中…" : "没有记忆文件"}</div>
            ) : (
              files.map((file) => (
                <button
                  key={file.path}
                  type="button"
                  className={`memory-item${file.path === selected ? " active" : ""}`}
                  title={`${file.path}\n${formatSize(file.size)}${file.description ? `\n${file.description}` : ""}`}
                  onClick={() => setSelected(file.path)}
                >
                  <span className="memory-item-path">
                    {file.isSystem ? <span className="memory-badge">系统</span> : null}
                    {file.path}
                  </span>
                  <span className="memory-item-meta">
                    {formatSize(file.size)}
                    {file.kind && file.kind !== "markdown" ? ` · ${file.kind}` : ""}
                  </span>
                </button>
              ))
            )}
          </nav>

          <section className="memory-detail">
            {!current ? (
              <div className="memory-empty">从左侧选一个文件</div>
            ) : (
              <>
                <div className="memory-detail-head">
                  <span className="memory-detail-path" title={current.path}>{current.path}</span>
                  <div className="modal-actions">
                    {editing ? (
                      <>
                        <input
                          type="text"
                          className="memory-commit-input"
                          placeholder="提交说明（可选）"
                          value={commitMessage}
                          disabled={working}
                          onChange={(e) => setCommitMessage(e.target.value)}
                        />
                        <button type="button" className="btn-accent" disabled={working || !dirty} onClick={() => void save()}>
                          {working ? "保存中…" : dirty ? "保存并提交" : "无改动"}
                        </button>
                        <button
                          type="button"
                          disabled={working}
                          onClick={() => { setEditing(false); setDraft(raw ?? ""); setCommitMessage(""); setError(null); }}
                        >
                          取消
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="btn-soft" onClick={() => setEditing(true)}>编辑</button>
                        <button type="button" disabled={working} onClick={() => void showHistory(current.path)}>历史</button>
                        <button type="button" className="btn-danger" disabled={working} onClick={() => void remove()}>删除</button>
                      </>
                    )}
                  </div>
                </div>

                {current.description ? <div className="memory-desc">{current.description}</div> : null}
                {editing ? (
                  <div className="memory-note">
                    编辑的是**文件原文**（含 <code>---</code> 之间的 frontmatter）。
                    记忆校验要求 markdown 以 frontmatter 开头，改坏了会被拒绝保存。
                  </div>
                ) : null}

                {editing ? (
                  <textarea
                    className="memory-editor"
                    value={draft}
                    disabled={working}
                    spellCheck={false}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                ) : loadingRaw ? (
                  <div className="memory-empty">读取原始内容…</div>
                ) : (
                  // 显示**原始**内容（含 frontmatter）—— 只显示正文会让用户以为
                  // 文件里没有 frontmatter，编辑时被拒就摸不着头脑。
                  <pre className="memory-content">{raw ?? "（空文件）"}</pre>
                )}

                {history ? (
                  <div className="memory-history">
                    <div className="memory-history-head">
                      <span>提交历史（{history.length}）</span>
                      <button type="button" onClick={() => setHistory(null)}>收起</button>
                    </div>
                    {history.length === 0 ? (
                      <div className="memory-empty">没有历史提交</div>
                    ) : (
                      <ul>
                        {history.map((c) => (
                          <li key={c.hash}>
                            <code>{c.hash.slice(0, 8)}</code>
                            <span>{c.message ?? "(无说明)"}</span>
                            <span className="memory-history-date">{c.date ?? ""}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>

        {error ? <div className="memory-error">⚠️ {error}</div> : null}
      </div>
    </div>
  );
}
