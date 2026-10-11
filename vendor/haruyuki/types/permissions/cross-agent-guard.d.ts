export interface CrossAgentGuardOptions {
    env?: NodeJS.ProcessEnv;
    currentAgentId?: string | null;
    disableMemoryGuard?: boolean;
}
export declare function isMemoryGuardDisabled(options?: CrossAgentGuardOptions): boolean;
/**
 * Resolve the set of agent IDs a guarded process is allowed to operate
 * against without disabling the guard.
 */
export declare function resolveAllowedAgents(options?: CrossAgentGuardOptions): Set<string>;
type ToolArgs = Record<string, unknown>;
export interface CrossAgentTargets {
    /** Agent IDs extracted from any path references in the tool args. */
    agentIds: Set<string>;
    /**
     * True iff at least one target path resolved under a cross-agent memory tree
     * (`~/.haruyuki/agents/<id>/...` on API, `<storage>/memfs/<id>/...` on local) —
     * the only case where the guard is concerned at all.
     */
    anyAgentScoped: boolean;
}
/**
 * Classification of a path relative to a cross-agent memory tree:
 *  - `outside`     — path is unrelated to the tree.
 *  - `agents-root` — path is exactly the tree root (enumeration of every agent
 *                    on the machine).
 *  - `ancestor`    — path is an ancestor of the tree root (e.g. `$HOME`, `/`).
 *                    Directory search tools (Glob/Grep/LS) entering this path would
 *                    walk into other agents' directories.
 *  - `agent`       — path is inside a specific agent's directory (any depth,
 *                    including the bare agent dir). The `id` is the agent ID
 *                    component (the segment right under the tree root).
 */
export type AgentsTreeClassification = {
    kind: "outside";
} | {
    kind: "agents-root";
} | {
    kind: "ancestor";
} | {
    kind: "agent";
    id: string;
};
/**
 * Extract file directives from an ApplyPatch input.
 */
export declare function extractApplyPatchPaths(input: string): string[];
export declare function extractFilePath(toolArgs: ToolArgs): string | null;
/**
 * Extract the agent IDs referenced by the target paths of an in-process file
 * tool call. Returns `anyAgentScoped: false` for tool calls that don't touch
 * agent memory at all (the guard's fast path). Shell tools are NOT handled
 * here — the kernel sandbox confines spawned shells.
 */
export declare function extractTargetAgentPaths(toolName: string, toolArgs: ToolArgs, workingDirectory: string, env?: NodeJS.ProcessEnv, homeDir?: string): CrossAgentTargets;
export interface CrossAgentGuardResult {
    matchedRule: "cross-agent guard";
    reason: string;
    offendingAgentIds: string[];
}
/**
 * Evaluate whether an in-process file tool call should be hard-denied because
 * it targets another agent's memory. Returns null when the guard is not
 * concerned.
 *
 * Shell tools are not evaluated: spawned shells are confined by the kernel
 * filesystem sandbox. A subagent confined as a whole process by the kernel
 * (sandbox sentinel set) is also skipped — its every tool, in-process file ops
 * included, is already kernel-isolated.
 */
export declare function evaluateCrossAgentGuard(toolName: string, toolArgs: ToolArgs, workingDirectory: string, options?: CrossAgentGuardOptions): CrossAgentGuardResult | null;
export {};
//# sourceMappingURL=cross-agent-guard.d.ts.map