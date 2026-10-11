import { type SandboxAvailability } from "../sandbox/availability";
import { type SandboxBackend } from "../sandbox/policy";
/**
 * Everything `applyShellSandbox` needs to wrap a launcher, resolved once. The
 * gate computes the backend, the agents trees, and the agent's memory roots
 * while deciding whether to wrap at all; returning them lets the wrapper build
 * the policy without re-probing the host or re-resolving the same paths.
 */
export interface ShellSandboxContext {
    /** The validated backend to wrap with (never null). */
    backend: SandboxBackend;
    /** Resolved bwrap binary path, when `backend === "bwrap"`. */
    bwrapPath?: string;
    /** Both backend agents trees to wall off (canonical). */
    agentsTreeRoots: string[];
    /** The agent's resolvable memory roots, to carve self back out of the trees. */
    memoryRoots: string[];
}
/**
 * Resolve the context for confining an agent process's shell commands under the
 * kernel cross-agent sandbox, or null when this process's shells must not be
 * wrapped (not opted in, already sandboxed, no backend, cwd inside the agents
 * tree, or no resolvable self roots).
 *
 * Opt-in via `HARUYUKI_FS_SANDBOX=1`: by default only memory subagents are
 * sandboxed (as whole processes) and agent shells run unconfined. When opted
 * in, the kernel sandbox is the sole cross-agent enforcement for spawned shells
 * (the static cross-agent guard no longer analyzes shell commands), so this is
 * what `applyShellSandbox` consults to decide whether — and with what — to wrap.
 */
export declare function resolveShellSandboxContext(cwd: string, env: NodeJS.ProcessEnv, availability?: SandboxAvailability): ShellSandboxContext | null;
/**
 * Whether an agent process's shell commands will be confined by the kernel
 * cross-agent sandbox — i.e. exactly the conditions under which
 * `applyShellSandbox` wraps the launcher. Thin boolean view over
 * {@link resolveShellSandboxContext}.
 */
export declare function willSandboxShell(cwd: string, env: NodeJS.ProcessEnv, availability?: SandboxAvailability): boolean;
//# sourceMappingURL=sandbox-gate.d.ts.map