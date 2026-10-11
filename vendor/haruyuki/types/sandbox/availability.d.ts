import type { SandboxBackend } from "./policy.js";
export interface SandboxAvailability {
    /** The usable backend, or null when none is available on this host. */
    backend: SandboxBackend | null;
    /** Resolved bwrap binary path, when `backend === "bwrap"`. */
    bwrapPath?: string;
    /** Human-readable explanation, primarily for the null case. */
    reason: string;
}
export interface DetectOptions {
    /** Override the platform (for tests). Defaults to `process.platform`. */
    platform?: NodeJS.Platform;
    /** Bypass the module-level cache (for tests / re-probing). */
    force?: boolean;
}
/**
 * Detect which filesystem-sandbox backend works on this host, probing for real
 * (Seatbelt: binary presence; bwrap: an actual user-namespace mount probe).
 * Result is cached for the process since it cannot change mid-run.
 */
export declare function detectSandboxBackend(options?: DetectOptions): SandboxAvailability;
/** Clear the cached probe result (tests only). */
export declare function resetSandboxAvailabilityCache(): void;
/**
 * Whether the memory-subagent filesystem sandbox is enabled. It is **on by
 * default**: memory subagents (reflection, memory, init) run
 * as whole confined processes with a scoped write surface, and there is no
 * interactive approve/deny flow that could stand in for it. Set
 * `HARUYUKI_FS_SANDBOX=0` (or `false`) to opt out entirely. When no backend is
 * available on the host, {@link detectSandboxBackend} returns `{backend:null}`
 * and every sandbox entry point no-ops regardless of this flag.
 *
 * Lives in this leaf so both subagent spawning (agent layer) and parent Bash
 * wrapping (tools layer) gate on the same env var without importing each other.
 */
export declare function isFsSandboxEnabled(env?: NodeJS.ProcessEnv): boolean;
/**
 * Whether the cross-agent shell sandbox (per-shell-command confinement of the
 * agent process's spawned shells) is enabled. It is **off by default**: an
 * interactive agent's own shells walling off other agents' memory broke
 * legitimate workflows (agents inspecting `~/.haruyuki/agents`) with kernel
 * `Operation not permitted` errors that no permission mode could approve
 * through. Set `HARUYUKI_FS_SANDBOX=1` (or `true`) to opt in — recommended for
 * multi-tenant deployments (app server, experiment runners) where one host
 * runs many agents that must not read each other's memory.
 *
 * `HARUYUKI_FS_SANDBOX` semantics across both checks:
 *   - unset  → memory subagents sandboxed; agent shells unconfined
 *   - `1`/`true`  → both sandboxed
 *   - `0`/`false` → nothing sandboxed
 */
export declare function isShellSandboxEnabled(env?: NodeJS.ProcessEnv): boolean;
/**
 * Emit a loud, once-per-process warning when sandboxing was requested but this
 * host cannot provide a kernel backend. We intentionally continue rather than
 * fail closed: users can still work, but should know filesystem isolation is
 * degraded on this host.
 */
export declare function warnSandboxBackendUnavailable(availability: SandboxAvailability, context: string): void;
//# sourceMappingURL=availability.d.ts.map