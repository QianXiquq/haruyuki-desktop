export interface GitContextSnapshot {
    isGitRepo: boolean;
    branch: string | null;
    status: string | null;
    recentCommits: string | null;
    gitUser: string | null;
}
export interface GatherGitContextOptions {
    cwd?: string;
    recentCommitLimit?: number;
    /**
     * Git log format string passed to `git log --format=...`.
     * If omitted, uses `git log --oneline`.
     */
    recentCommitFormat?: string;
    statusLineLimit?: number;
}
export declare function gatherGitContextSnapshot(options?: GatherGitContextOptions): GitContextSnapshot;
export interface LightGitContext {
    branch: string | null;
    recent_branches: string[];
}
/**
 * Get a lightweight git context suitable for the DeviceStatus payload.
 * Fast: only runs `git branch --show-current` and `git branch --sort=-committerdate`.
 * Returns null if the cwd is not inside a git repo.
 */
export declare function getGitContextAsync(cwd: string): Promise<LightGitContext | null>;
//# sourceMappingURL=git-context.d.ts.map