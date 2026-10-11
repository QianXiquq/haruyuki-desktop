import { type BackendMode } from "../../backend";
import type { SubagentLaunchProfile, SubagentMemoryScope } from ".";
interface ResolveSubagentLauncherOptions {
    env?: NodeJS.ProcessEnv;
    argv?: string[];
    execPath?: string;
    platform?: NodeJS.Platform;
    cwd?: string;
}
interface SubagentLauncher {
    command: string;
    args: string[];
}
export declare function resolveSubagentWorkingDirectory(env?: NodeJS.ProcessEnv, fallbackCwd?: string, options?: {
    subagentType?: string;
    launchProfile?: SubagentLaunchProfile;
    inheritedPrimaryRoot?: string | null;
    memoryScope?: SubagentMemoryScope;
}): string;
export declare function resolveSubagentLauncher(cliArgs: string[], options?: ResolveSubagentLauncherOptions): SubagentLauncher;
export interface ComposeSubagentChildEnvOptions {
    /** The env of the process spawning the subagent (parent). */
    parentProcessEnv: NodeJS.ProcessEnv;
    /** Active backend mode to force in the child CLI process. */
    backendMode?: BackendMode;
    /** Local backend flatfile root to forward when backendMode="local". */
    localBackendStorageDir?: string | null;
    /** Parent agent ID. When present, sets HARUYUKI_PARENT_AGENT_ID so prompts,
     * scripts, and the cross-agent guard can identify the immediate parent. */
    parentAgentId: string | undefined;
    parentConversationId?: string;
    /** Subagent config type, used for type-specific child process isolation. */
    subagentType?: string;
    /** The subagent config's declared launch profile. Subagents with the memory-subagent profile
     * operate on the parent's memory filesystem. */
    launchProfile: SubagentLaunchProfile | undefined;
    /** Primary memory root for the parent, used by the memory-subagent launch
     * profile to point the child at its parent's memfs repo. Null means memfs
     * disabled or unresolvable — child operates without a MEMORY_DIR. */
    inheritedPrimaryRoot: string | null;
    /** Optional exact memory scope for harness-created worktrees. */
    memoryScope?: SubagentMemoryScope;
    /** Forwarded API key to avoid per-subagent keychain lookups. */
    inheritedApiKey?: string | null;
    /** Forwarded base URL to avoid per-subagent settings lookups. */
    inheritedBaseUrl?: string | null;
    /** Authenticated Cloud user responsible for the parent turn. */
    /** Optional path to a transcript payload file, exposed to the child as
     * the TRANSCRIPT_PATH env var. Used by reflection subagents so the prompt
     * can reference `$TRANSCRIPT_PATH` (resolved via Bash) instead of
     * interpolating the absolute path. Unset → no TRANSCRIPT_PATH in child. */
    transcriptPath?: string | null;
    /** Name reserved in the parent process, only for a newly created agent. */
    subagentName?: string;
    /** Parent-process task ID used to isolate child background output files. */
    subagentId?: string;
}
/**
 * Compose the env a subagent child process should be spawned with.
 *
 * The parent identity marker and filesystem pointer are intentionally
 * decoupled:
 *
 *   - HARUYUKI_PARENT_AGENT_ID identifies the immediate parent. Subagents never
 *     inherit a broad cross-agent memory-guard opt-out from the parent.
 *
 *   - MEMORY_DIR / LETTA_MEMORY_DIR are only overridden when the subagent
 *     declares the memory-subagent launch profile. Those subagents operate on
 *     the parent's memory as their working filesystem (reflection, memory,
 *     init). Other subagents keep whatever MEMORY_DIR they
 *     inherited from the parent process (usually unset).
 *
 * Pure function, no side effects — straightforward to unit-test.
 */
export declare function composeSubagentChildEnv(options: ComposeSubagentChildEnvOptions): NodeJS.ProcessEnv;
export declare function shouldLaunchThroughListener(options: {
    launchProfile?: string;
    computer?: string;
    ephemeral?: boolean;
}): boolean;
export declare function resolveSubagentInheritedPrimaryRoot(options: {
    backendMode: BackendMode;
    parentAgentId: string | undefined;
    inheritedPrimaryRoot: string | null;
    localBackendStorageDir?: string | null;
}): string | null;
export {};
//# sourceMappingURL=subagent-launcher.d.ts.map