import type { SubagentResult } from "./";
import { type EnqueueReceipt } from "../../backend/api/conversation-enqueue";
import { type ExecutionState } from "./subagent-stream";
/** The submitting CLI has exited. The harness follows its Cloud receipt. */
export declare function collectRemoteTurnResult(receipt: EnqueueReceipt, state: ExecutionState, subagentId: string, signal?: AbortSignal): Promise<SubagentResult>;
//# sourceMappingURL=remote-turn-wait.d.ts.map