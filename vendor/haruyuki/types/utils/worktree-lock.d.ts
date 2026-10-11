/**
 * Cross-agent advisory lock so two conversations do not both switch into the
 * same worktree and clobber each other's uncommitted work. The lock is a small
 * JSON file written into the worktree's per-worktree git admin directory
 * (`<common>/worktrees/<name>/`), which keeps it out of the working tree and
 * lets `git worktree remove` clean it up automatically.
 *
 * This module is the pure file-backed primitive (acquire/release plus ownership
 * and liveness rules). The session-aware orchestration that resolves git dirs
 * and reads the runtime context lives with the worktree tool.
 */
export declare const LOCK_FILENAME = "haruyuki-enter.lock";
export interface WorktreeLockOwner {
    conversationId: string | null;
    agentId: string | null;
}
export interface WorktreeLock {
    conversationId: string | null;
    agentId: string | null;
    pid: number;
    hostname: string;
    acquiredAt: string;
}
export type WorktreeLockOutcome = {
    outcome: "acquired" | "reentrant" | "reclaimed" | "forced";
    lock: WorktreeLock;
    previous?: WorktreeLock;
} | {
    outcome: "conflict";
    heldBy: WorktreeLock;
};
export declare function describeHolder(lock: WorktreeLock): string;
/**
 * Acquires (or refreshes) the advisory lock for a worktree on behalf of
 * `owner`. Returns a `conflict` outcome when the worktree is actively held by a
 * different, live owner and `force` is not set; otherwise writes the lock and
 * reports how it was obtained.
 */
export declare function acquireWorktreeLock(params: {
    worktreeGitDir: string;
    owner: WorktreeLockOwner;
    force?: boolean;
}): Promise<WorktreeLockOutcome>;
/** Releases `owner`'s lock on a worktree. No-op if it is held by someone else. */
export declare function releaseWorktreeLock(params: {
    worktreeGitDir: string;
    owner: WorktreeLockOwner;
}): Promise<boolean>;
//# sourceMappingURL=worktree-lock.d.ts.map