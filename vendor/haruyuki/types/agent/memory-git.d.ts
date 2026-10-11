export interface MemoryCommitAuthor {
    agentId: string;
    authorName: string;
    authorEmail?: string;
}
export interface CommitMemoryWriteParams {
    memoryDir: string;
    pathspecs: string[];
    reason: string;
    author: MemoryCommitAuthor;
    syncMode?: MemoryWriteSyncMode;
}
export type MemoryWriteSyncMode = "remote" | "local";
export interface CommitMemoryWriteResult {
    committed: boolean;
    sha?: string;
}
/** Get the agent root directory (~/.haruyuki/agents/{id}/) */
export declare function getAgentRootDir(agentId: string): string;
/** Get the git repo directory for memory (now ~/.haruyuki/agents/{id}/memory/) */
export declare function getMemoryRepoDir(agentId: string): string;
/**
 * Normalize a configured server URL for use in git credential config keys.
 *
 * Git credential config lookup is sensitive to URL key shape. We normalize to
 * origin form (scheme + host + optional port) and remove trailing slashes so
 * pull/push flows remain resilient when HARUYUKI_MEMFS_BASE_URL /
 * LETTA_BASE_URL has path/trailing-slash variations.
 */
export declare function normalizeCredentialBaseUrl(serverUrl: string): string;
/**
 * Redact git auth material from command/error text before it reaches logs.
 *
 * Node's child_process errors include the full command line in `message`/`cmd`.
 * MemFS git operations pass API keys through `-c http.extraHeader=...`, so a
 * failed clone/fetch/pull/push can otherwise print a reusable credential.
 */
export declare function redactGitAuthInText(value: string): string;
/**
 * Returns true when a remote URL points to this agent's memfs git endpoint.
 */
export declare function isMemfsRemoteUrlForAgent(remoteUrl: string, agentId: string): boolean;
/**
 * Returns true when an origin URL is clearly intended to be a Letta MemFS
 * remote for this agent, including older/broken forms we can safely repair.
 */
export declare function isRepairableMemfsRemoteUrl(remoteUrl: string, agentId: string): boolean;
/** Git remote URL for the agent's state repo */
export declare function getGitRemoteUrl(agentId: string, baseUrl?: string): string;
export declare function getRepositoryRemoteUrl(agentId: string, repositoryName: string, baseUrl?: string): string;
export declare function getRepositoryMountDir(agentId: string, repositoryName: string): string;
export declare function validateAgentRepositoryName(name: string): string;
interface RepositoryMountGitArgs {
    agentId: string;
    repositoryName: string;
    directory: string;
    remoteUrl: string;
    token: string;
    publishedDirectory?: string;
}
export declare function prepareAttachedRepositoryForGitOps(args: RepositoryMountGitArgs): Promise<void>;
/**
 * Keep the local repo's `origin` URL aligned with the current server base URL.
 *
 * Best-effort: if origin is missing or not a memfs endpoint for this agent,
 * this function is a no-op.
 */
export declare function maybeUpdateMemoryRemoteOrigin(repoDir: string, agentId: string): Promise<void>;
export declare function buildGitAuthArgs(token: string, env?: NodeJS.ProcessEnv): string[];
export declare function isMemfsGitNetworkCommand(args: string[]): boolean;
export declare function buildMemfsGitProxyArgs(args: string[], env?: NodeJS.ProcessEnv): string[];
export declare function shouldConfigurePersistentMemfsCredentialHelper(env?: NodeJS.ProcessEnv): boolean;
export declare function buildNonInteractiveGitEnv(env?: NodeJS.ProcessEnv): NodeJS.ProcessEnv;
export declare function runGit(cwd: string, args: string[], token?: string, options?: {
    timeoutMs?: number;
}): Promise<{
    stdout: string;
    stderr: string;
}>;
/**
 * Returns true when a git error looks transient/retryable (network/edge).
 *
 * These failures are commonly seen during HTTP 503 outages or Cloudflare 52x
 * errors during memfs clone/pull operations.
 */
export declare function isRetryableGitTransientError(error: unknown): boolean;
export declare function isMissingCwdGitError(error: unknown): boolean;
export declare function runGitWithRetry(cwd: string, args: string[], token?: string, options?: {
    operation?: string;
    attempts?: number;
    baseDelayMs?: number;
    timeoutMs?: number;
}): Promise<{
    stdout: string;
    stderr: string;
}>;
/** Read a local-scoped git config value. Null when unset; reads take no lock. */
export declare function getLocalGitConfig(dir: string, key: string): Promise<string | null>;
/** Set a local-scoped git config value. Serialized per repo. */
export declare function setLocalGitConfig(dir: string, key: string, value: string): Promise<void>;
/** Ensure local main tracks only origin/main and direct commits use the agent identity. */
export declare function ensureLocalMemfsGitConfig(dir: string, agentId: string): Promise<void>;
/** Return the currently-configured memory-repository URL for this agent, or null. */
export declare function getMemoryRepositoryUrl(agentId: string): Promise<string | null>;
/**
 * Configure a memory-repository URL for this agent's memfs repo.
 * Re-installs the post-commit hook defensively so that prior manual edits
 * or stale state don't cause silent push drops.
 */
export declare function setMemoryRepositoryUrl(agentId: string, url: string): Promise<void>;
/** Remove the memory-repository URL configuration for this agent. */
export declare function unsetMemoryRepositoryUrl(agentId: string): Promise<void>;
export interface MemoryRepositoryPushResult {
    ok: boolean;
    url: string | null;
    branch: string | null;
    output: string;
}
/**
 * One-shot push to the memory-repository remote. Used by
 * `/memory-repository push` to retry after a failure or to do an initial push
 * without waiting for the next commit.
 */
export declare function pushToMemoryRepository(agentId: string): Promise<MemoryRepositoryPushResult>;
/**
 * Return the tail of the memory-repository push log.
 * Used by `/memory-repository status`.
 */
export declare function readMemoryRepositoryPushLog(agentId: string, tailLines?: number): string;
export declare function isNonFastForwardPushError(error: unknown): boolean;
export declare function prepareMemoryRepoForGitOps(memoryDir: string, agentId: string, token: string): Promise<void>;
export declare function commitMemoryWrite(params: CommitMemoryWriteParams): Promise<CommitMemoryWriteResult>;
export declare function isGitRepo(agentId: string): boolean;
export interface InitializeLocalMemoryRepoFile {
    relativePath: string;
    content: string;
}
export interface InitializeLocalMemoryRepoParams {
    memoryDir: string;
    agentId: string;
    authorName?: string;
    files: InitializeLocalMemoryRepoFile[];
}
export declare function getMemoryHeadRevision(memoryDir: string): Promise<string | null>;
export declare function initializeLocalMemoryRepo(params: InitializeLocalMemoryRepoParams): Promise<void>;
export interface SyncAgentRepositoriesResult {
    mounted: number;
    skipped: number;
    failed: number;
    summaries: string[];
}
export declare function syncAttachedAgentRepositories(agentId: string): Promise<SyncAgentRepositoriesResult>;
/**
 * Clone the agent's state repo into the memory directory.
 *
 * Git root is ~/.haruyuki/agents/{id}/memory/ (not the agent root).
 */
export declare function cloneMemoryRepo(agentId: string): Promise<void>;
/**
 * Pull latest changes from the server.
 * Called on startup to ensure local state is current.
 */
export interface PullMemoryOptions {
    throwOnFailure?: boolean;
}
export declare function pullMemory(agentId: string, options?: PullMemoryOptions): Promise<{
    updated: boolean;
    summary: string;
}>;
/**
 * Push local memory commits to the server.
 * Keeps remote writes explicit: no automatic pull --rebase.
 */
export declare function pushMemory(agentId: string): Promise<void>;
export interface MemoryGitStatus {
    /** Uncommitted changes in working tree */
    dirty: boolean;
    /** Local commits not pushed to remote */
    aheadOfRemote: boolean;
    /** Human-readable summary for system reminder */
    summary: string;
}
export type MemoryPostTurnSyncStatus = "clean" | "pushed" | "dirty" | "conflict" | "invalid" | "push_failed" | "skipped";
export interface MemoryPostTurnSyncResult {
    status: MemoryPostTurnSyncStatus;
    summary: string;
    memoryDir: string;
    localOnly: boolean;
}
/**
 * Check git status of the memory directory.
 * Used to decide whether to inject a sync reminder.
 */
export declare function getMemoryGitStatus(agentId: string): Promise<MemoryGitStatus>;
export declare function getMemoryConflictSummary(memoryDir: string, statusOut?: string): Promise<string | null>;
export declare function getMemoryAheadBehind(memoryDir: string): Promise<{
    ahead: number;
    behind: number;
} | null>;
/**
 * The post-turn publish lives in `./memory-post-turn-sync` — see that module for
 * why it is not here (this file is at its size ratchet).
 */
/**
 * Add the git-memory-enabled tag to an agent.
 * This triggers the backend to create the git repo.
 */
export declare function addGitMemoryTag(agentId: string, prefetchedAgent?: {
    tags?: string[] | null;
}): Promise<void>;
export {};
//# sourceMappingURL=memory-git.d.ts.map