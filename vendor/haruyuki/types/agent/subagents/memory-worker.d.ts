import type { MemoryPostTurnSyncResult } from "../memory-git";
import { syncPendingMemoryCommitsAfterTurn } from "../memory-post-turn-sync";
import type { SubagentMemoryScope, SubagentResult } from ".";
interface MemoryWorkerParams {
    agentId: string;
    conversationId: string;
    memoryDir: string;
    /**
     * Set for a harness-launched conflict repair: the attempt token from
     * `claimMemoryConflictRepair`, which the worker advances or forgets.
     */
    repairToken?: string;
    signal?: AbortSignal;
}
/** Spawn the worker on the given checkout; resolves with its result. */
type MemoryWorkerExecute = (memoryDir: string, memoryScope: SubagentMemoryScope) => Promise<SubagentResult>;
interface MemoryWorkerDeps {
    sync?: typeof syncPendingMemoryCommitsAfterTurn;
    /** Awaited so the repair task is registered before this worker completes. */
    repair?: (result: MemoryPostTurnSyncResult) => void | Promise<unknown>;
    /** Memory on disk changed (a merge, a push, or a pull); refresh readers. */
    onMemoryChanged?: () => void;
}
/**
 * Run a memory worker under the checkout lease.
 *
 * An update worker edits a private worktree of the memory repository, so the
 * primary agent's own edits to the checkout are never touched: a cancelled
 * worker is discarded outright, and a finished worker's commits are merged
 * back before the lease is released. A merge that conflicts with the
 * primary's changes keeps the worker's branch and reports it instead of
 * guessing. A repair worker must work on the checkout itself, where the
 * unfinished Git operation lives.
 *
 * Called inside the existing background task, never awaited by the primary.
 */
export declare function runMemoryWorker(params: MemoryWorkerParams, execute: MemoryWorkerExecute, deps?: MemoryWorkerDeps): Promise<SubagentResult>;
export {};
//# sourceMappingURL=memory-worker.d.ts.map