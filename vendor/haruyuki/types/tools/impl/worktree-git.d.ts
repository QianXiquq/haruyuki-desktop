/**
 * Git and path plumbing shared by the worktree tools.
 *
 * EnterWorktree and ExitWorktree both need to shell out to git, classify its
 * failures, and locate the primary checkout. Keeping that here lets each tool
 * module stay focused on its own flow instead of one importing internals of
 * the other.
 */
export type GitResult = {
    stdout: string;
    stderr: string;
    exitCode: number | null;
};
export declare function formatGitFailure(error: unknown): string;
export declare function addWindowsPathLengthHint(message: string, platform?: NodeJS.Platform): string;
export declare function buildNonInteractiveGitEnv(base?: NodeJS.ProcessEnv): NodeJS.ProcessEnv;
export declare function runGit(args: string[], cwd: string, options?: {
    timeoutMs?: number;
    allowFailure?: boolean;
    signal?: AbortSignal;
}): Promise<GitResult>;
export declare function gitStdout(args: string[], cwd: string): Promise<string>;
export declare function gitRefExists(cwd: string, ref: string): Promise<boolean>;
/**
 * Creates a worktree without executing commands planted inside the repository's
 * git directory: checkout filters from repository-local or worktree-scoped git
 * config, the `core.fsmonitor` command, and hooks such as post-checkout. An
 * agent can write those files, so letting them run during `git worktree add`
 * would bypass the normal shell permission path. Config shapes that cannot be
 * safely overridden fail closed.
 */
export declare function addWorktreeSafely(params: {
    repoRoot: string;
    branchName: string;
    worktreePath: string;
    baseRef: string;
}): Promise<void>;
export declare function resolveRepoRoot(cwd: string): Promise<string>;
export declare function resolvePrimaryWorktreeRoot(repoRoot: string): Promise<string>;
export declare function resolveDefaultBaseRef(repoRoot: string): Promise<string>;
export declare function isPathWithin(child: string, parent: string): boolean;
//# sourceMappingURL=worktree-git.d.ts.map