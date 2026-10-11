import { type SandboxAvailability } from "../../sandbox/availability";
import { type SandboxBackend } from "../../sandbox/policy";
import type { SubagentLaunchProfile } from ".";
/**
 * Applies an OS-level filesystem sandbox to a subagent child process at spawn.
 *
 * Subagents with the memory-subagent profile (reflection, memory, init) operate
 * on their parent's memory as their working filesystem. Wrapping the whole child
 * process kernel-enforces the write scope — covering its in-process Write/Edit
 * tools, its Bash commands, and anything those spawn.
 *
 * Enabled by default (unlike the cross-agent shell sandbox, which is opt-in:
 * memory subagents run non-interactively, so there is no approve/deny flow to
 * fall back on); set `HARUYUKI_FS_SANDBOX=0` to opt out. No-ops when the host has
 * no sandbox backend.
 *
 * Both backends scope writes to the harness state dir (`~/.haruyuki`): a memory
 * subagent may persist memory + harness metadata (settings, logs, conversations,
 * transcripts) but not the repo, home, or temp. Both cross-agent trees
 * (`~/.haruyuki/agents` for API/cloud and `lc-local-backend/memfs` for local) stay
 * read- and write-denied; self memory is re-carved writable. Carving the whole
 * `~/.haruyuki` rather than each harness file avoids silently breaking harness
 * writes (settings, etc.) as new writers appear under it.
 */
interface SubagentLauncher {
    command: string;
    args: string[];
}
export interface WrapSubagentLauncherInput {
    launcher: SubagentLauncher;
    /** The subagent's declared launch profile; only memory-subagent is wrapped. */
    launchProfile: SubagentLaunchProfile | undefined;
    /** Active backend; selects the tree + write posture ("local" vs "api"). */
    backendMode: string;
    /** Resolved memory roots the child may write to (MEMORY_DIR + siblings). */
    memoryRoots: string[];
    /** MEMORY_DIR target; folded into the writable set if not already present. */
    inheritedPrimaryRoot: string | null;
    /** Optional exact memory scope for harness-created worktrees. */
    memoryScope?: {
        primaryRoot: string | null;
        writableRoots: string[];
        readonlyRoots?: string[];
    };
    /**
     * Local backend storage dir (`~/.haruyuki/lc-local-backend`), used to locate the
     * `memfs` cross-agent tree. Only consulted when `backendMode === "local"`;
     * null/omitted falls back to the default storage dir.
     */
    localBackendStorageDir?: string | null;
    env?: NodeJS.ProcessEnv;
    /** Injectable for tests; defaults to a real host probe. */
    availability?: SandboxAvailability;
}
export interface WrapSubagentLauncherResult {
    command: string;
    args: string[];
    /** Env additions to merge into the child env (the sandbox sentinel). */
    sandboxEnv: Record<string, string>;
    backend: SandboxBackend;
}
/**
 * Wrap a subagent launcher under a memory-subagent sandbox, or return null to
 * spawn it unchanged (flag off, not memory-subagent, no backend on host, or
 * nothing to restrict).
 */
export declare function wrapSubagentLauncher(input: WrapSubagentLauncherInput): WrapSubagentLauncherResult | null;
export {};
//# sourceMappingURL=sandbox.d.ts.map