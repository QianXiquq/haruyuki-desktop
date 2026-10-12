import { useState } from "react";
import type { DirectoryListing, WorkingDirectorySummary } from "@/shared/ipc-contract";

interface Props {
  cwd: WorkingDirectorySummary | null;
  disabled: boolean;
  onApply: (path: string, applyToAll: boolean) => Promise<void>;
  /** 列一层目录（同时用于校验路径）。 */
  onList: (path: string) => Promise<DirectoryListing>;
}

/** 路径显示：太长就只留尾部，完整路径走 title。 */
function shortPath(path: string): string {
  if (!path) return "（未知）";
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 3) return path;
  return `…/${parts.slice(-3).join("/")}`;
}

/**
 * 去掉 Electron 给 IPC 错误加的包装。
 *
 * 跨 `ipcRenderer.invoke` 抛出的错误，`message` 会被加上
 * `Error invoking remote method 'haruyuki:xxx': Error: ` 前缀 —— 那是**实现细节**，
 * 对用户是噪音（实测界面上就是这么显示的）。真正的失败原因在后半段，这里剥出来。
 */
function cleanIpcError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  return raw.replace(/^Error invoking remote method '[^']*':\s*(Error:\s*)?/, "").trim() || raw;
}

function parentOf(path: string): string {
  const trimmed = path.replace(/\/+$/, "");
  const idx = trimmed.lastIndexOf("/");
  return idx <= 0 ? "/" : trimmed.slice(0, idx);
}

/**
 * 当前会话的工作目录：**显示 + 切换**。
 *
 * ## 为什么它在 GUI 里比在 TUI 里更需要
 *
 * TUI 里你在哪个目录启动、`cd` 到哪里是肉眼可见的。GUI 曾经**完全看不出** agent
 * 在哪工作（实测确认），于是所有涉及文件的任务都是盲操作：你对它说"改一下这个函数"，
 * 它去的是服务端启动目录，而你不知道那是哪、也改不了。
 *
 * ## 切换为什么是安全的
 *
 * 主进程做三步：**先用 `list_in_directory` 校验目录存在** → 发 `input{payload.cwd}`
 * 并**等 `input_accepted` 回执** → **回读 `get_cwd_map` 确认**。任一步失败都会抛错，
 * 不会出现"界面显示改了、实际没改"。
 */
export function WorkingDirectory({ cwd, disabled, onApply, onList }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [applyToAll, setApplyToAll] = useState(false);
  const [browse, setBrowse] = useState<DirectoryListing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const current = cwd?.current ?? "";

  function openEditor(): void {
    setDraft(current);
    setError(null);
    setBrowse(null);
    setEditing(true);
  }

  async function submit(path: string): Promise<void> {
    const target = path.trim();
    if (!target) {
      setError("目录不能为空");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onApply(target, applyToAll);
      setEditing(false);
      setBrowse(null);
    } catch (e) {
      // 主进程的失败原因直接显示 —— 包括"回读不一致"这类需要人判断的情况。
      setError(cleanIpcError(e));
    } finally {
      setBusy(false);
    }
  }

  async function openBrowse(path: string): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const listing = await onList(path);
      if (!listing.success) {
        setError(listing.error ?? `无法列出 ${path}`);
        return;
      }
      setBrowse(listing);
      setDraft(listing.path);
    } catch (e) {
      setError(cleanIpcError(e));
    } finally {
      setBusy(false);
    }
  }

  if (!editing) {
    return (
      <div className="cwd">
        <span className="cwd-label">目录</span>
        <button
          type="button"
          className="cwd-value"
          disabled={disabled || !current}
          title={current ? `${current}\n（点击切换）` : "尚无工作目录"}
          onClick={openEditor}
        >
          {shortPath(current)}
        </button>
        {cwd && !cwd.overridden && cwd.boot ? (
          <span className="cwd-badge" title="该会话没有自己的目录覆盖，用的是服务端启动目录">
            默认
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="cwd-editor">
      <div className="cwd-row">
        <input
          type="text"
          className="cwd-input"
          value={draft}
          disabled={busy}
          placeholder="绝对路径，或相对当前目录（如 ../foo）"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit(draft);
            if (e.key === "Escape") setEditing(false);
          }}
        />
        <button type="button" className="cwd-go" disabled={busy} onClick={() => void submit(draft)}>
          {busy ? "…" : "切换"}
        </button>
        <button type="button" className="cwd-go" disabled={busy} onClick={() => void openBrowse(draft || current)}>
          浏览
        </button>
        <button type="button" className="cwd-cancel" disabled={busy} onClick={() => setEditing(false)}>
          取消
        </button>
      </div>

      <label
        className="cwd-check"
        title="只影响没有自己目录覆盖的会话；已经有自己目录的会话不会被改动"
      >
        <input
          type="checkbox"
          checked={applyToAll}
          disabled={busy}
          onChange={(e) => setApplyToAll(e.target.checked)}
        />
        设为默认目录（只影响未覆盖的会话）
      </label>

      {browse ? (
        <div className="cwd-browser">
          <div className="cwd-browser-path">
            <button type="button" className="cwd-up" disabled={busy} onClick={() => void openBrowse(parentOf(browse.path))}>
              ↑ 上级
            </button>
            <span title={browse.path}>{browse.path}</span>
          </div>
          <div className="cwd-folders">
            {browse.folders.length === 0 ? (
              <span className="muted">（没有子目录）</span>
            ) : (
              browse.folders.map((folder) => (
                <button
                  key={folder}
                  type="button"
                  className="cwd-folder"
                  disabled={busy}
                  title={folder}
                  onClick={() => void openBrowse(folder)}
                >
                  {folder.split("/").filter(Boolean).pop() ?? folder}
                </button>
              ))
            )}
          </div>
          <div className="cwd-browser-actions">
            <button type="button" className="cwd-go" disabled={busy} onClick={() => void submit(browse.path)}>
              用这个目录
            </button>
          </div>
        </div>
      ) : null}

      {error ? <div className="cwd-error">⚠️ {error}</div> : null}
    </div>
  );
}
