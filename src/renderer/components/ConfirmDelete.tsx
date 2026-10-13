import { useState } from "react";

interface Props {
  /** 要删的东西的名字（会话标题等）。用户必须**逐字输入**它才能确认。 */
  target: string;
  /** 弹窗标题，例如「删除会话」。 */
  title: string;
  /** 补充说明（不可逆、影响范围等）。 */
  detail?: string;
  busy: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 危险操作的确认弹窗。
 *
 * ## 为什么要求"逐字输入"而不是"点确定"
 *
 * 删除会话**不可逆**：协议没有删除命令，我们直接删本地目录，**没有回收站**。
 * 而普通的两按钮确认框点两下就过去了 —— 手滑一次就没了。
 * 要求输入目标的名字，能确保用户**看清了自己在删什么**，也几乎不可能误触。
 */
export function ConfirmDelete({ target, title, detail, busy, error, onConfirm, onCancel }: Props) {
  const [typed, setTyped] = useState("");
  const matches = typed.trim() === target.trim();

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
      <div className="modal confirm-modal">
        <header className="modal-head">
          <span className="modal-title danger">{title}</span>
        </header>

        <div className="confirm-body">
          <p className="confirm-lead">即将<strong>永久删除</strong>：</p>
          <div className="confirm-target" title={target}>{target}</div>
          {detail ? <p className="confirm-detail">{detail}</p> : null}
          <p className="confirm-warn">
            ⚠️ 此操作<strong>不可撤销</strong>，没有回收站。记忆文件不受影响（记忆按 agent 存，与会话无关）。
          </p>

          <label className="confirm-field">
            <span>请输入上面的名字以确认：</span>
            <input
              type="text"
              autoFocus
              value={typed}
              disabled={busy}
              placeholder={target}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches && !busy) onConfirm();
                if (e.key === "Escape" && !busy) onCancel();
              }}
            />
          </label>

          {error ? <div className="confirm-error">⚠️ {error}</div> : null}
        </div>

        <footer className="confirm-actions">
          <button type="button" disabled={busy} onClick={onCancel}>
            取消
          </button>
          <button type="button" className="btn-danger" disabled={!matches || busy} onClick={onConfirm}>
            {busy ? "删除中…" : matches ? "永久删除" : "请先输入名字"}
          </button>
        </footer>
      </div>
    </div>
  );
}
