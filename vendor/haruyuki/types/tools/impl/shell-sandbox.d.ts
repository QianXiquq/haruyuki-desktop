import { type SandboxAvailability } from "../../sandbox/availability";
import { type SandboxBackend } from "../../sandbox/policy";
/**
 * Applies the cross-agent filesystem sandbox to an agent process's shell
 * commands at spawn. The whole shell — and anything it forks — runs under a
 * kernel policy that denies reading or writing other agents' memory while
 * leaving the current agent's own directory, the repo, and temp writable.
 *
 * Shared by every shell executor — the `Bash` tool (`bash.ts`), the Codex
 * `exec_command`/`write_stdin` sessions (`exec-command.ts`) — so the kernel owns the whole shell
 * surface, not just one dialect.
 *
 * This is the SOLE cross-agent enforcement for spawned shells: the static
 * cross-agent guard no longer analyzes shell commands (it was bypassable by
 * symlinks, command substitution, globbing, and subprocesses). The kernel
 * resolves real paths regardless of how the command spelled them.
 *
 * OFF by default; set `HARUYUKI_FS_SANDBOX=1` to opt in (recommended for
 * multi-tenant deployments where agents must not read each other's memory).
 * No-ops when the host has no sandbox backend.
 */
export interface ShellSandboxResult {
    launcher: string[];
    env: NodeJS.ProcessEnv;
    /** The backend the launcher was wrapped with, or null when left unchanged. */
    backend: SandboxBackend | null;
}
/**
 * Apply the cross-agent sandbox to an agent shell launcher. Returns the
 * launcher (possibly wrapped) and the env to spawn it with (carrying the
 * sandbox sentinel when wrapped). Returns the inputs unchanged when the shared
 * gate ({@link resolveShellSandboxContext}) says this process's shells are not
 * to be wrapped (flag off, already sandboxed, no backend, cwd inside the agents
 * tree, or no resolvable self roots).
 */
export declare function applyShellSandbox(launcher: string[], cwd: string, env: NodeJS.ProcessEnv, 
/** Injectable for tests; defaults to a real host probe. */
availability?: SandboxAvailability): ShellSandboxResult;
//# sourceMappingURL=shell-sandbox.d.ts.map