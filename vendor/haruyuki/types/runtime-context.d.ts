import type { SkillSource } from "./agent/skills";
import type { RuntimeExecutionSettings } from "./runtime-execution-settings";
export type RuntimePermissionMode = "standard" | "acceptEdits" | "unrestricted" | "strict";
export interface RuntimeWorkspaceSandbox {
    /** Runtime-owned writable workspace. */
    root: string;
    /** Parent tree whose peer workspaces must stay hidden. */
    isolationRoot: string;
}
export interface RuntimeContextSnapshot {
    /** Listener transport connection that owns the current turn, when present. */
    connectionId?: string | null;
    /** Registered listener device that owns the current turn, when present. */
    environmentDeviceId?: string | null;
    agentId?: string | null;
    agentName?: string | null;
    conversationId?: string | null;
    skillsDirectory?: string | null;
    skillSources?: SkillSource[];
    workingDirectory?: string | null;
    /**
     * Set when the runtime-scoped working directory was found deleted and
     * repaired to a fallback mid-turn. Holds the original (now missing) path
     * until a shell tool consumes it to surface a note to the model.
     */
    workingDirectoryRecoveredFrom?: string | null;
    toolContextId?: string | null;
    permissionMode?: RuntimePermissionMode;
    workspaceSandbox?: RuntimeWorkspaceSandbox;
    executionSettings?: RuntimeExecutionSettings;
}
export declare function getRuntimeContext(): RuntimeContextSnapshot | undefined;
export declare function runWithRuntimeContext<T>(snapshot: RuntimeContextSnapshot, fn: () => T): T;
export declare function runOutsideRuntimeContext<T>(fn: () => T): T;
export declare function updateRuntimeContext(update: Partial<RuntimeContextSnapshot>): void;
export declare function getFallbackWorkingDirectory(): string;
export declare function getCurrentWorkingDirectory(): string;
/**
 * Returns (and clears) the original path of a working directory that was
 * repaired mid-turn because it no longer existed, or null when no recovery
 * happened. Shell tools use this to tell the model its cwd changed.
 */
export declare function consumeWorkingDirectoryRecovery(): string | null;
//# sourceMappingURL=runtime-context.d.ts.map