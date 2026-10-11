import type { PendingApproval } from "@/renderer/state/use-haruyuki";

interface Props {
  approval: PendingApproval;
  onDecide: (requestId: string, decision: "allow" | "deny") => void;
}

export function ApprovalCard({ approval, onDecide }: Props) {
  const inputText =
    typeof approval.input === "string" ? approval.input : JSON.stringify(approval.input, null, 2);

  return (
    <div className="approval-card">
      <div className="approval-title">需要你批准：{approval.toolName}</div>
      <pre className="approval-input">{inputText}</pre>
      <div className="approval-actions">
        <button type="button" className="allow" onClick={() => onDecide(approval.requestId, "allow")}>
          允许
        </button>
        <button type="button" className="deny" onClick={() => onDecide(approval.requestId, "deny")}>
          拒绝
        </button>
      </div>
    </div>
  );
}
