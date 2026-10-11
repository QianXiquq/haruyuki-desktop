import type { HookEvent, HookExecutionResult } from "./types";
export { areHooksDisabled, clearHooksCache } from "./loader";
export * from "./types";
/**
 * Run PreToolUse hooks before a tool is executed
 * Can block the tool call by returning blocked: true
 */
export declare function runPreToolUseHooks(toolName: string, toolInput: Record<string, unknown>, toolCallId?: string, workingDirectory?: string, agentId?: string): Promise<HookExecutionResult>;
/**
 * Run PostToolUse hooks after a tool has executed
 * These run in parallel since they cannot block
 */
export declare function runPostToolUseHooks(toolName: string, toolInput: Record<string, unknown>, toolResult: {
    status: "success" | "error";
    output?: string;
}, toolCallId?: string, workingDirectory?: string, agentId?: string, precedingReasoning?: string, precedingAssistantMessage?: string): Promise<HookExecutionResult>;
/**
 * Run PostToolUseFailure hooks after a tool has failed
 * These run in parallel and cannot block (tool already failed)
 * Stderr from hooks with exit code 2 is fed back to the agent
 */
export declare function runPostToolUseFailureHooks(toolName: string, toolInput: Record<string, unknown>, errorMessage: string, errorType?: string, toolCallId?: string, workingDirectory?: string, agentId?: string, precedingReasoning?: string, precedingAssistantMessage?: string): Promise<HookExecutionResult>;
/**
 * Run PermissionRequest hooks when a permission dialog would be shown
 * Can auto-allow (exit 0) or auto-deny (exit 2) the permission
 */
export declare function runPermissionRequestHooks(toolName: string, toolInput: Record<string, unknown>, permissionType: "allow" | "deny" | "ask", scope?: "session" | "project" | "user", workingDirectory?: string, agentId?: string): Promise<HookExecutionResult>;
/**
 * Run UserPromptSubmit hooks before processing a user's prompt
 * Can block the prompt from being processed
 * Skips execution for slash commands (e.g., /help, /clear)
 */
export declare function runUserPromptSubmitHooks(prompt: string, isCommand: boolean, agentId?: string, conversationId?: string, workingDirectory?: string): Promise<HookExecutionResult>;
/**
 * Run Notification hooks when a notification is sent
 * These run in parallel and cannot block
 */
export declare function runNotificationHooks(message: string, level?: "info" | "warning" | "error", workingDirectory?: string): Promise<HookExecutionResult>;
/**
 * Run Stop hooks when the agent finishes responding
 * Can block stoppage (exit 2), stderr shown to model
 */
export declare function runStopHooks(stopReason: string, messageCount?: number, toolCallCount?: number, workingDirectory?: string, precedingReasoning?: string, assistantMessage?: string, userMessage?: string): Promise<HookExecutionResult>;
/**
 * Run SubagentStop hooks when a subagent task completes
 * Can block stoppage (exit 2), stderr shown to subagent
 */
export declare function runSubagentStopHooks(subagentType: string, subagentId: string, success: boolean, error?: string, agentId?: string, conversationId?: string, workingDirectory?: string): Promise<HookExecutionResult>;
/**
 * Run PreCompact hooks before a compact operation
 * Cannot block, stderr shown to user only
 */
export declare function runPreCompactHooks(contextLength?: number, maxContextLength?: number, agentId?: string, conversationId?: string, workingDirectory?: string): Promise<HookExecutionResult>;
/**
 * Run SessionStart hooks when a session begins
 * Unlike other hooks, SessionStart collects stdout (not stderr) on exit 2
 * to inject context into the first user message
 */
export declare function runSessionStartHooks(isNewSession: boolean, agentId?: string, agentName?: string, conversationId?: string, workingDirectory?: string): Promise<HookExecutionResult>;
/**
 * Run SessionEnd hooks when a session ends
 */
export declare function runSessionEndHooks(durationMs?: number, messageCount?: number, toolCallCount?: number, agentId?: string, conversationId?: string, workingDirectory?: string): Promise<HookExecutionResult>;
/**
 * Check if hooks are configured for a specific event
 */
export declare function hasHooks(event: HookEvent, workingDirectory?: string): Promise<boolean>;
//# sourceMappingURL=index.d.ts.map