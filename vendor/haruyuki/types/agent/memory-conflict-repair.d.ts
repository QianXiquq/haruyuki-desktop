export type MemoryRepairKind = "conflict" | "invalid";
export type MemoryConflictRepairClaim = 
/** Recorded; the caller launches a worker that carries `token`. */
{
    status: "claimed";
    token: string;
}
/** A running process is still repairing this conflict. */
 | {
    status: "in_progress";
}
/** A worker has run on this conflict and could not resolve it. */
 | {
    status: "attempted";
};
/**
 * Record that automatic repair is being attempted for the current conflict or
 * invalid history, unless the same state is already handled: a repair worker
 * has run and could not resolve it (reported to the agent instead of
 * relaunched every turn), or a repair is still in progress in a running
 * process. An attempt whose process is gone before the worker ran (crashed)
 * is retried. A checkout that is not a readable Git repository is left to
 * the worker, which reports the failure itself.
 */
export declare function claimMemoryConflictRepair(memoryDir: string, kind?: MemoryRepairKind): Promise<MemoryConflictRepairClaim>;
/** The repair worker ran; the same state is not attempted again automatically. */
export declare function completeMemoryConflictRepair(memoryDir: string, token: string): Promise<void>;
/**
 * The attempt never ran (launch failed, cancelled, nothing left to repair);
 * let the next turn retry. Only the record for `token` is removed, so a
 * worker forgetting its attempt after the lease is gone cannot drop a newer
 * claim.
 */
export declare function clearMemoryConflictRepair(memoryDir: string, token: string): Promise<void>;
//# sourceMappingURL=memory-conflict-repair.d.ts.map