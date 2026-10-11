/**
 * Tool name mapping utilities for display purposes.
 * Centralizes tool name remapping logic used across the UI.
 */
/**
 * Maps internal tool names to user-friendly display names.
 * Handles multiple tool naming conventions:
 * - Anthropic toolset (snake_case and camelCase)
 * - Codex toolset (snake_case and PascalCase)
 */
export declare function getDisplayToolName(rawName: string): string;
/**
 * Checks if a tool name represents a Task/subagent tool
 */
export declare function isTaskTool(name: string): boolean;
/**
 * Checks if a tool name represents the background Workflow orchestration tool
 */
export declare function isWorkflowTool(name: string): boolean;
/**
 * Checks if a tool name represents a TODO/planning tool
 */
export declare function isTodoTool(rawName: string, displayName?: string): boolean;
/**
 * Checks if a tool name is part of the Task* CRUD family
 * (TaskCreate / TaskGet / TaskList / TaskUpdate).
 */
export declare function isTaskCrudTool(rawName: string): boolean;
/**
 * Checks if a tool name represents a plan update tool
 */
export declare function isPlanTool(rawName: string, displayName?: string): boolean;
/**
 * Checks if a tool requires specialized inline UI instead of generic approval
 * rendering. File edit/write/patch tools and shell tools use their own views.
 */
export declare function isFancyUITool(name: string): boolean;
/**
 * Checks if a tool is a memory tool (client-side MemFS memory editing)
 */
export declare function isMemoryTool(name: string): boolean;
/**
 * Checks if a tool is a file edit tool (has old_string/new_string args)
 */
export declare function isFileEditTool(name: string): boolean;
/**
 * Checks if a tool is a file write tool (has file_path/content args)
 */
export declare function isFileWriteTool(name: string): boolean;
/**
 * Checks if a tool is a file read tool (has file_path arg)
 */
export declare function isFileReadTool(name: string): boolean;
/**
 * Checks if a tool is a patch tool (applies unified diffs)
 */
export declare function isPatchTool(name: string): boolean;
/**
 * Checks if a tool is a shell/bash tool
 */
export declare function isShellTool(name: string): boolean;
/**
 * Checks if a tool should use shell-style streaming output rendering.
 * Includes shell command tools plus the retired TaskOutput/BashOutput pollers,
 * which saved transcripts still contain.
 */
export declare function isShellOutputTool(name: string): boolean;
/**
 * Checks if a tool is a search/grep tool
 */
export declare function isSearchTool(name: string): boolean;
/**
 * Checks if a tool is web search.
 */
export declare function isWebSearchTool(name: string | undefined): boolean;
/**
 * Checks if a tool is a glob tool
 */
export declare function isGlobTool(name: string): boolean;
//# sourceMappingURL=tool-name-mapping.d.ts.map