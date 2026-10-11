export interface ReflectionMemoryWorktree {
    id: string;
    parentMemoryDir: string;
    worktreeBaseDir: string;
    worktreeDir: string;
    branchName: string;
    baseHead: string;
    gitCommonDir: string;
}
export interface CreateReflectionMemoryWorktreeOptions {
    parentMemoryDir: string;
    now?: Date;
    /** Directory and branch prefix; memory workers use "memory-worker". */
    label?: string;
}
export declare function createReflectionMemoryWorktree(options: CreateReflectionMemoryWorktreeOptions): Promise<ReflectionMemoryWorktree>;
export interface ReflectionMemoryScope {
    primaryRoot: string;
    writableRoots: string[];
    readonlyRoots: string[];
}
export declare function buildReflectionMemoryScope(worktree: ReflectionMemoryWorktree): ReflectionMemoryScope;
export declare function buildReflectionIntegrationMemoryScope(worktree: ReflectionMemoryWorktree): ReflectionMemoryScope;
export type ReflectionMemoryWorktreeFinalizeStatus = "merged" | "no_changes" | "parent_dirty" | "merge_conflict" | "dirty_uncommitted" | "failed";
export interface ReflectionMemoryWorktreeFinalizeResult {
    status: ReflectionMemoryWorktreeFinalizeStatus;
    parentMemoryDir: string;
    reflectionWorktreeDir: string;
    reflectionBranch: string;
    commitCount: number;
    head?: string;
    summary: string;
    error?: string;
    failurePhase?: "reflection" | "integration";
}
export declare function reflectionIntegrationConsumesTranscript(result: ReflectionMemoryWorktreeFinalizeResult): boolean;
export declare function reflectionMemoryParentHasChanges(parentMemoryDir: string): Promise<boolean>;
export interface ReflectionMemoryWorktreeState {
    commitCount: number;
    dirty: boolean;
    head?: string;
}
export declare function inspectReflectionMemoryWorktree(worktree: ReflectionMemoryWorktree): Promise<ReflectionMemoryWorktreeState>;
/** Finalize without taking the checkout lease; the caller must already hold it. */
export declare function finalizeReflectionMemoryWorktreeUnlocked(worktree: ReflectionMemoryWorktree, options: ReflectionMemoryWorktreeFinalizeOptions): Promise<ReflectionMemoryWorktreeFinalizeResult>;
export declare function finalizeReflectionMemoryWorktree(worktree: ReflectionMemoryWorktree, options: ReflectionMemoryWorktreeFinalizeOptions): Promise<ReflectionMemoryWorktreeFinalizeResult>;
export type MemoryWorkerWorktreeOutcome = {
    status: "merged";
    commitCount: number;
    head: string;
} | {
    status: "no_changes";
} | {
    status: "discarded";
} | {
    status: "merge_conflict";
    commitCount: number;
    branchName: string;
} | {
    status: "failed";
    error: string;
};
/**
 * Bring a memory worker's worktree back into the parent checkout. The caller
 * must hold the checkout lease. Commits are merged (fast-forward when
 * possible); uncommitted edits in the worktree are dropped, as are all edits
 * when `discard` is set (a cancelled worker). A merge that conflicts with the
 * parent's own changes is aborted and the branch is kept so nothing is lost.
 * Unlike reflection, a dirty parent does not block the merge: Git refuses only
 * when the parent's uncommitted files overlap the worker's commits, and that
 * surfaces as a conflict here.
 */
export declare function integrateMemoryWorkerWorktree(worktree: ReflectionMemoryWorktree, options?: {
    discard?: boolean;
}): Promise<MemoryWorkerWorktreeOutcome>;
export interface ReflectionMemoryWorktreeFinalizeOptions {
    shouldMerge: boolean;
    knownNoChanges?: boolean;
    failureSummary?: string;
    requireAlreadyMerged?: boolean;
}
//# sourceMappingURL=memory-worktree.d.ts.map