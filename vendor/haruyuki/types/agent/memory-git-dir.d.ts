/**
 * Canonical path of a checkout's Git directory. Worktrees have their own, so
 * state kept here (locks, repair attempts, operation heads) stays independent
 * of the worktrees that share the repository.
 */
export declare function getMemoryGitDir(memoryDir: string): Promise<string>;
//# sourceMappingURL=memory-git-dir.d.ts.map