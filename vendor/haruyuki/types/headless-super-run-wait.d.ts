import type { Message, Run } from "@letta-ai/letta-client/resources/agents/messages";
import type { EnqueueReceipt, ExactSuperRun } from "./backend/api/conversation-enqueue";
import type { EnqueuedReply } from "./headless-enqueue-wait";
export interface SuperRunWaitDeps {
    exact: (agentId: string, superRunId: string, signal: AbortSignal) => Promise<ExactSuperRun>;
    run: (runId: string, signal: AbortSignal) => Promise<Run>;
    messages: (runId: string, signal: AbortSignal) => Promise<Message[]>;
    pollMs?: number;
    sleep?: (ms: number, signal: AbortSignal) => Promise<void>;
}
/** Follow the exact accepted send. Reads may retry; the task is never resubmitted. */
export declare function waitForAcceptedSuperRun(receipt: EnqueueReceipt, signal: AbortSignal, deps: SuperRunWaitDeps): Promise<EnqueuedReply>;
//# sourceMappingURL=headless-super-run-wait.d.ts.map