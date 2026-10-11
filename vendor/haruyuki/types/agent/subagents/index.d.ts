/**
 * Subagent configuration, discovery, and management
 *
 * Built-in subagents are bundled with the package.
 * Users can also define custom subagents as Markdown files with YAML frontmatter
 * in the .haruyuki/agents/ directory.
 */
import type { LocalMemoryFormat } from "../memory-format";
/**
 * Subagent configuration
 */
export type SubagentLaunchProfile = "default" | "memory-subagent";
/** Exact memory scope handed to a harness-created memory worktree. */
export interface SubagentMemoryScope {
    primaryRoot: string | null;
    writableRoots: string[];
    readonlyRoots?: string[];
}
/**
 * Subagent execution result
 */
export interface SubagentResult {
    agentId: string;
    conversationId?: string;
    /** Native session/thread identifier for a non-Letta execution runtime. */
    runtimeSessionId?: string;
    model?: string;
    report: string;
    success: boolean;
    error?: string;
    totalTokens?: number;
    stepCount?: number;
    durationMs?: number;
}
export interface SubagentConfig {
    /** Unique identifier for the subagent */
    name: string;
    /** Description of when to use this subagent */
    description: string;
    /** System prompt for the subagent */
    systemPrompt: string;
    /** Allowed tools - specific list or "all" (invalid names are ignored at runtime) */
    allowedTools: string[] | "all";
    /** Skills to auto-load */
    skills: string[];
    /** Whether this subagent should fork the parent conversation before launch. */
    fork: boolean;
    /** Filesystem and env launch behavior for this subagent. */
    launchProfile: SubagentLaunchProfile;
}
/**
 * Result of subagent discovery
 */
export interface SubagentDiscoveryResult {
    subagents: SubagentConfig[];
    errors: Array<{
        path: string;
        message: string;
    }>;
    /**
     * Non-fatal problems: the subagent still loads, but something it declares no
     * longer has any effect (for example a `model:` frontmatter field).
     */
    warnings: Array<{
        path: string;
        message: string;
    }>;
}
export declare const EXTERNAL_CODING_AGENT_DESCRIPTORS: readonly [{
    readonly name: "claude-code";
    readonly description: "Run the locally installed Claude Code CLI as a one-shot coding worker";
}, {
    readonly name: "codex";
    readonly description: "Start a locally installed Codex coding session with mid-turn steering";
}];
/**
 * Directory for subagent files (relative to project root)
 */
export declare const AGENTS_DIR: string;
export declare const GLOBAL_AGENTS_DIR: string;
export declare function resolveSubagentConfigForMemoryFormat(config: SubagentConfig, memoryFormat: LocalMemoryFormat, localMemfs: boolean): SubagentConfig;
/**
 * Get the names of built-in subagents
 */
export declare function getBuiltinSubagentNames(): Set<string>;
/**
 * Discover subagents from global (~/.haruyuki/agents) and project (.haruyuki/agents) directories
 * Project-level subagents override global ones with the same name
 */
export declare function discoverSubagents(workingDirectory?: string, inheritedConfigs?: Record<string, SubagentConfig>): Promise<SubagentDiscoveryResult>;
/**
 * Get all subagent configurations
 * Includes built-in subagents and any user-defined ones from .haruyuki/agents/
 * User-defined subagents override built-ins with the same name
 * Results are cached per working directory
 */
export declare function getAllSubagentConfigs(workingDirectory?: string): Promise<Record<string, SubagentConfig>>;
export declare function getModelFacingSubagentDescriptors(workingDirectory: string): Promise<Array<{
    name: string;
    description: string;
}>>;
/**
 * Clear the subagent config cache (useful when files change)
 */
export declare function clearSubagentConfigCache(): void;
//# sourceMappingURL=index.d.ts.map