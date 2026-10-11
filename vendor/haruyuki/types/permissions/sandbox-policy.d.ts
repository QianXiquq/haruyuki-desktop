import { type FsSandboxPolicy } from "../sandbox/policy";
/**
 * Builders that translate agent/memory context into a concrete
 * {@link FsSandboxPolicy}. This is the bridge between the domain (agent ids,
 * memory roots) and the pure `@/sandbox` generators — it lives in
 * `permissions/` alongside the static guards it is meant to replace.
 *
 * Every root is canonicalized with realpath before it reaches a backend: both
 * Seatbelt and bwrap match rules against the kernel-resolved path, so a policy
 * built from a lexical path that passes through a symlink would silently match
 * nothing — i.e. a sandbox that allows everything. See `canonicalizeRoot`.
 */
/** The per-agent tree to wall off, e.g. `/Users/me/.haruyuki/agents`. */
export declare function getDefaultAgentsTreeRoot(homeDir?: string): string;
export interface CrossBackendAgentsTreeRootsOptions {
    homeDir?: string;
    env?: NodeJS.ProcessEnv;
    /** Explicit local backend storage dir, when already resolved by a caller. */
    localBackendStorageDir?: string | null;
}
/**
 * Every cross-agent memory tree the kernel sandbox must wall off. API/cloud
 * agents live under `~/.haruyuki/agents`; local-backend agents live under
 * `<storage>/memfs`. A process running in either backend must deny both trees,
 * then carve back only the current/parent agent roots it is allowed to touch.
 */
export declare function getCrossBackendAgentsTreeRoots(options?: CrossBackendAgentsTreeRootsOptions): string[];
/**
 * The harness state directory, e.g. `/Users/me/.haruyuki`. Used as the broad
 * writable base for memory subagents: they may write harness metadata anywhere
 * under it (settings, logs, conversations, transcripts, memory) but not the
 * repo/home/temp — while the cross-agent tree nested inside it stays denied.
 */
export declare function getHaruyukiHomeRoot(homeDir?: string): string;
/**
 * Resolve a path to the real (symlink-free) path the kernel will see. The leaf
 * may not exist yet (a file about to be created), so we realpath the nearest
 * existing ancestor and re-append the missing tail.
 */
export declare function canonicalizeRoot(input: string): string;
/**
 * Map memory roots to the agent directories to carve out of the walled-off
 * agents tree. A memory root under the tree
 * (`~/.haruyuki/agents/<id>/memory[-worktrees]`) yields the whole agent dir
 * (`~/.haruyuki/agents/<id>`); carving the *agent dir* rather than just `/memory`
 * keeps the cwd's immediate parent traversable, so a read-deny on the tree does
 * not empty the child env under Seatbelt. Roots outside the tree (a custom
 * `MEMORY_DIR`) are returned as-is.
 */
export declare function deriveSelfAgentRootsForTrees(memoryRoots: string[], agentsTreeRoots?: string[]): string[];
export interface MemorySubagentSandboxInput {
    /**
     * Memory roots the child may write to — typically the resolved
     * `MEMORY_DIR` plus its `memory-worktrees` sibling.
     */
    memoryRoots: string[];
    /** Additional roots to carve back read-only after denying agents trees. */
    readonlyRoots?: string[];
    /**
     * Harness state roots configured OUTSIDE `~/.haruyuki` to also make writable —
     * `~/.haruyuki` itself is always the base. The caller passes a custom
     * `LETTA_LOCAL_BACKEND_DIR` / `LETTA_TRANSCRIPT_ROOT` here so the in-process
     * child can still persist conversation/agent-state/transcripts when those are
     * relocated off the default tree. Usually empty (the defaults live under
     * `~/.haruyuki`).
     */
    harnessWritableRoots?: string[];
    /**
     * The agents trees to wall off + carve self out of. Defaults to both
     * `~/.haruyuki/agents` (API/cloud) and `lc-local-backend/memfs` (local). Each
     * agent's memory lives at `<tree>/<id>/memory` on both, so
     * {@link deriveSelfAgentRootsForTrees} carves the same way regardless of
     * backend.
     *
     * Resolved by the caller's layer (`tools/` / `agent/`, which may import
     * `backend/`): `permissions/` sits below `backend/`, so this builder takes the
     * already-resolved path rather than branching on a backend it cannot import.
     */
    agentsTreeRoots?: string[];
}
/**
 * Policy for the memory-subagent launch profile: it may read the filesystem broadly to do
 * its work, write only under the harness state dir (`~/.haruyuki`), and not read or
 * write *other* agents' memory.
 *
 * The whole subagent process runs under this policy, so it is the sole
 * enforcement for these agents — the static guard is skipped for them. It covers
 * both axes:
 *   - writes: `restrictWrites` denies writes everywhere except the base
 *     `~/.haruyuki` carve (and self memory). This scopes the agent's
 *     non-deterministic work — it can persist memory + harness metadata
 *     (settings, logs, conversations, transcripts) but cannot write the repo,
 *     home, or temp. Carving the WHOLE `~/.haruyuki` rather than enumerating each
 *     harness file is deliberate: the harness writes many paths under it and the
 *     set is unbounded, so a per-file carve would silently break as new writers
 *     appear. The cross-agent tree nested inside `~/.haruyuki` stays denied.
 *   - cross-agent reads: the agents tree is read+write denied, with the agent's
 *     own (and inherited parent's) directory carved back out READ-only.
 *
 * Carving the whole agent *directory* readable — not just `/memory` — is what
 * lets us deny the tree without re-triggering the empty-env bug: the subagent's
 * cwd is its memory dir inside the agents tree, and under Seatbelt a child
 * launches with an EMPTY environment if a cwd *ancestor* is read-denied. With
 * the agent dir (the cwd's immediate parent) readable, process init can traverse
 * to the cwd and the env survives.
 *
 * Both backend trees are denied by default so cloud/API agents cannot read local
 * agent memories and local agents cannot read cloud/API memories. Self memory is
 * re-carved writable in `writableRoots` because it is nested inside a denied
 * tree (the base `~/.haruyuki` carve is overridden there by the deny).
 */
export declare function buildMemorySubagentSandboxPolicy(input: MemorySubagentSandboxInput): FsSandboxPolicy;
export interface CrossAgentSandboxInput {
    /**
     * Directories the agent may freely read+write inside the walled-off agents
     * tree — typically its own agent directory (`~/.haruyuki/agents/<self-id>`).
     */
    selfRoots: string[];
    /** The agents trees to wall off (read+write). Defaults to both backends. */
    agentsTreeRoots?: string[];
}
/**
 * Policy for a normal agent that may use the whole filesystem but must not read
 * or write *other* agents' memory. This is the kernel-enforced replacement for
 * the static cross-agent guard.
 *
 * Walls off both backend agents trees (read + write) and carves the agent's own
 * directory back out. Writes elsewhere — the repo, the home dir, temp — stay
 * allowed (`restrictWrites: false`): the only thing this policy removes is
 * access to other agents' memory, exactly like the guard it replaces.
 *
 * Unlike the memory-subagent policy, this one DOES deny reads of the agents tree.
 * That is only safe when the process cwd is outside the tree (the parent
 * agent's cwd is the repo); a cwd inside a read-denied subtree launches with an
 * empty environment under Seatbelt. Callers must enforce that precondition.
 */
export declare function buildCrossAgentSandboxPolicy(input: CrossAgentSandboxInput): FsSandboxPolicy;
//# sourceMappingURL=sandbox-policy.d.ts.map