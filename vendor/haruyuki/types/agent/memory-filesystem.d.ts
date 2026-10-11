/**
 * Memory filesystem helpers.
 *
 * With git-backed memory, most sync/hash logic is removed.
 * This module retains: directory helpers, tree rendering, and
 * the shared memfs initialization logic used by both interactive
 * and headless code paths.
 */
import type { AgentState } from "@letta-ai/letta-client/resources/agents/agents";
import type { CreateBlock } from "@letta-ai/letta-client/resources/blocks/blocks";
import type { Backend } from "../backend";
export declare const MEMORY_FS_AGENTS_DIR = "agents";
export declare const MEMORY_FS_MEMORY_DIR = "memory";
export declare const MEMORY_SYSTEM_DIR = "system";
export declare const MEMORY_TREE_MAX_LINES: 500;
export declare const MEMORY_TREE_MAX_CHARS: 20000;
export declare const MEMORY_TREE_MAX_CHILDREN_PER_DIR: 50;
export interface MemoryTreeRenderOptions {
    maxLines?: number;
    maxChars?: number;
    maxChildrenPerDir?: number;
}
export declare function getMemoryFilesystemRoot(agentId: string, homeDir?: string, env?: NodeJS.ProcessEnv): string;
export declare function getMemorySystemDir(agentId: string, homeDir?: string, env?: NodeJS.ProcessEnv): string;
export declare function getScopedMemoryFilesystemRoot(agentId: string, options?: {
    env?: NodeJS.ProcessEnv;
    homeDir?: string;
    localBackendStorageDir?: string;
}): string;
export interface ResolveScopedMemoryDirOptions {
    agentId?: string | null;
    env?: NodeJS.ProcessEnv;
    homeDir?: string;
}
/**
 * Resolve the active memory directory for the current execution scope.
 *
 * Precedence is intentionally runtime-first:
 * 1. Explicit agent ID (caller-provided scope)
 * 2. In-process runtime/agent context
 * 3. Explicit MEMORY_DIR env fallback
 * 4. AGENT_ID env fallback
 */
export declare function resolveScopedMemoryDir(options?: ResolveScopedMemoryDirOptions): string | null;
export declare function ensureMemoryFilesystemDirs(agentId: string, homeDir?: string): void;
export interface MemfsCreateBodyLike {
    tags?: string[] | null;
    memory_blocks?: CreateBlock[] | null;
}
/**
 * Stamp the git-memory-enabled tag onto a create-agent body (pure helper).
 * Returns the body unchanged when the tag is already present.
 */
export declare function stampMemfsTagOnCreateBody<T extends MemfsCreateBodyLike>(body: T, gitMemoryEnabledTag: string): T;
/** Add the root marker that requests MemFS v2 repository initialization. */
export declare function stampRootMemoryOnCreateBody<T extends MemfsCreateBodyLike>(body: T): T;
/**
 * Prepare a raw (protocol-forwarded) create-agent body so the created agent
 * is MemFS v2-enabled from birth.
 *
 * Raw protocol paths (listener `agent_create` / `runtime_start.create_agent`)
 * forward client-provided bodies directly to the backend. Without this,
 * agents created on Letta Cloud are born without GIT_MEMORY_ENABLED_TAG and
 * every downstream tag-based check (isMemfsEnabledOnServer, memfs-sync,
 * hydrateMemfsSettingFromAgent) treats them as non-memfs — on every machine,
 * forever. Stamping the tag and the root MEMORY block atomically with
 * creation guarantees the server seeds a v2 repository and lazy sync paths
 * can finish the setup (clone, tool detach) even if this process dies.
 *
 * The local backend stamps the tag itself in LocalBackend.createAgent(), and
 * non-cloud remote backends don't support memfs sync, so both pass through.
 */
export declare function prepareRawCreateAgentBodyForMemfs<T extends MemfsCreateBodyLike>(body: T): Promise<T>;
export declare function hydrateMemfsSettingFromAgent(agent: Pick<AgentState, "id" | "tags">): Promise<boolean>;
/**
 * Returns whether memfs is enabled for the agent on the server.
 *
 * This is a read-only check used by desktop/listener surfaces that need to
 * distinguish "memfs disabled" from "enabled but local checkout missing"
 * without mutating agent configuration.
 */
export declare function isMemfsEnabledOnServer(agentId: string): Promise<boolean>;
export interface EnsureLocalMemfsCheckoutOptions {
    pullOnExistingRepo?: boolean;
}
/**
 * Ensures the local memfs checkout exists for an already-enabled agent.
 *
 * Unlike applyMemfsFlags(), this helper does not update prompts, tags, or
 * other agent configuration. It materializes the local git checkout when
 * missing and can optionally pull an existing remote-backed repo before use.
 */
export declare function ensureLocalMemfsCheckout(agentId: string, options?: EnsureLocalMemfsCheckoutOptions): Promise<void>;
export declare function labelFromRelativePath(relativePath: string): string;
/**
 * Render a tree visualization of the memory filesystem.
 * Takes system labels (under system/) and detached labels (at root).
 */
export declare function renderMemoryFilesystemTree(systemLabels: string[], detachedLabels: string[], options?: MemoryTreeRenderOptions): string;
export interface ApplyMemfsFlagsResult {
    /** Whether memfs was enabled or unchanged */
    action: "enabled" | "unchanged";
    /** Path to the memory directory (when enabled) */
    memoryDir?: string;
}
export interface ApplyMemfsFlagsOptions {
    pullOnExistingRepo?: boolean;
    agentTags?: string[];
    /** Skip the system prompt update (when the agent was created with the correct mode). */
    skipPromptUpdate?: boolean;
}
/**
 * Apply the --memfs CLI flag (or /memfs enable) to an agent.
 *
 * Shared between interactive (index.ts), headless (headless.ts), and
 * the /memfs enable command (App.tsx) to avoid duplicating the setup logic.
 *
 * MemFS cannot be disabled: agents are memfs-enabled from creation on
 * memfs-capable backends, and this function only enables or syncs.
 *
 * Steps when enabling:
 *   1. Validate MemFS API endpoint support (for explicit enable)
 *   2. Reconcile system prompt to the memfs memory mode
 *   3. Persist memfs setting locally
 *   4. Add git-memory-enabled tag + clone/pull repo
 *
 * @throws {Error} if MemFS endpoint validation fails or git setup fails
 */
export declare function applyMemfsFlags(agentId: string, memfsFlag: boolean | undefined, options?: ApplyMemfsFlagsOptions): Promise<ApplyMemfsFlagsResult>;
/**
 * Whether the current server is the Letta API (or local memfs testing is enabled).
 */
export declare function isLettaCloud(): Promise<boolean>;
/**
 * Whether the MemFS sync endpoint is backed by the Letta API.
 */
export declare function isLettaMemfsServer(): Promise<boolean>;
/**
 * Enable memfs for a newly created agent when the server owns the memory.
 *
 * This used to run only for a `remoteMemfs` backend on the Letta API, then call
 * `applyMemfsFlags` to tag the agent and clone its server-side repository. No
 * backend serves remote memory now, and a local backend enables memfs as part of
 * creating the agent, so there is nothing left to do. The function stays so the
 * post-create call sites keep their shape.
 */
export interface EnableMemfsIfCloudOptions {
    backend?: Backend;
    agentTags?: string[] | null;
}
export declare function enableMemfsIfCloud(_agentId: string, _options?: EnableMemfsIfCloudOptions): Promise<void>;
//# sourceMappingURL=memory-filesystem.d.ts.map