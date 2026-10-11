import { type HookCommand, type HookEvent, type HooksConfig } from "./types";
/**
 * Clear hooks cache - kept for API compatibility with existing callers.
 */
export declare function clearHooksCache(): void;
/**
 * Load global hooks configuration from ~/.haruyuki/settings.json
 * Uses settings-manager cache (loaded at app startup)
 */
export declare function loadGlobalHooks(): HooksConfig;
/**
 * Load project hooks configuration from .haruyuki/settings.json
 * Uses settings-manager cache
 */
export declare function loadProjectHooks(workingDirectory?: string): Promise<HooksConfig>;
/**
 * Load project-local hooks configuration from .haruyuki/settings.local.json
 * Uses settings-manager cache
 */
export declare function loadProjectLocalHooks(workingDirectory?: string): Promise<HooksConfig>;
/**
 * Merge hooks configurations
 * Priority order: project-local > project > global
 * For each event, hooks are ordered by priority (local first, global last)
 */
export declare function mergeHooksConfigs(global: HooksConfig, project: HooksConfig, projectLocal?: HooksConfig): HooksConfig;
/**
 * Load merged hooks configuration (global + project + project-local)
 */
export declare function loadHooks(workingDirectory?: string): Promise<HooksConfig>;
/**
 * Check if a tool name matches a matcher pattern
 * Patterns:
 * - "*" or "": matches all tools
 * - "ToolName": exact match (simple alphanumeric strings)
 * - "Edit|Write": regex alternation, matches Edit or Write
 * - "Notebook.*": regex pattern, matches Notebook, NotebookEdit, etc.
 * - Any valid regex pattern is supported (case-sensitive)
 */
export declare function matchesTool(pattern: string, toolName: string): boolean;
/**
 * Get all hooks that match a specific event and tool name
 */
export declare function getMatchingHooks(config: HooksConfig, event: HookEvent, toolName?: string): HookCommand[];
/**
 * Check if there are any hooks configured for a specific event
 */
export declare function hasHooksForEvent(config: HooksConfig, event: HookEvent): boolean;
/**
 * Check if all hooks are disabled via hooks.disabled across settings levels.
 *
 * Precedence:
 * 1. If user has disabled: false → ENABLED (explicit user override)
 * 2. If user has disabled: true → DISABLED
 * 3. If project OR project-local has disabled: true → DISABLED
 * 4. Default → ENABLED
 */
export declare function areHooksDisabled(workingDirectory?: string): boolean;
/**
 * Convenience function to load hooks and get matching ones for an event
 */
export declare function getHooksForEvent(event: HookEvent, toolName?: string, workingDirectory?: string): Promise<HookCommand[]>;
//# sourceMappingURL=loader.d.ts.map