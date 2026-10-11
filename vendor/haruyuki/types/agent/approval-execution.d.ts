import type { ApprovalReturn, ToolReturn } from "@letta-ai/letta-client/resources/agents/messages";
import type { ToolReturnMessage } from "@letta-ai/letta-client/resources/tools";
import type { ApprovalRequest } from "../cli/helpers/stream";
import { type ToolExecutionResult, type ToolReturnContent } from "../tools/manager";
/**
 * Extract displayable text from tool return content (for UI display).
 * Multimodal content returns the text parts concatenated.
 */
export declare function getDisplayableToolReturn(content: ToolReturnContent): string;
/**
 * Extract the resource key for a tool execution.
 * Tools with the same resource key must be serialized to avoid race conditions.
 *
 * Note: Only call this for non-parallel-safe tools. Use isParallelSafe() first.
 *
 * @param toolName - The name of the tool being executed
 * @param toolArgs - The arguments passed to the tool
 * @returns Resource key string for grouping
 */
export declare function getResourceKey(toolName: string, toolArgs: Record<string, unknown>, workingDirectory?: string): string;
/** Result format expected by App.tsx for auto-allowed tools */
export type AutoAllowedResult = {
    toolCallId: string;
    result: ToolExecutionResult;
};
export type ApprovalDecision = {
    type: "approve";
    approval: ApprovalRequest;
    reason?: string;
    precomputedResult?: ToolExecutionResult;
} | {
    type: "deny";
    approval: ApprovalRequest;
    reason: string;
};
export type ApprovalToolResult = ToolReturn & {
    reason?: string;
};
export type ApprovalResult = ApprovalToolResult | ApprovalReturn;
/**
 * Execute a batch of approval decisions and format results for the backend.
 *
 * This function handles:
 * - Executing approved tools (with error handling)
 * - Formatting denials
 * - Combining all results into a single batch
 *
 * Execution strategy for performance:
 * - Parallel-safe tools (read-only + Task) are executed in parallel
 * - Write tools are grouped by resource (file path) and executed with per-resource queuing:
 *   - Different resources → parallel execution
 *   - Same resource → sequential execution to avoid race conditions
 *
 * Used by both interactive (App.tsx) and headless (headless.ts) modes.
 *
 * @param decisions - Array of approve/deny decisions for each tool
 * @param onChunk - Optional callback to update UI with tool results (for interactive mode)
 * @returns Array of formatted results ready to send to backend (maintains original order)
 */
export declare function executeApprovalBatch(decisions: ApprovalDecision[], onChunk?: (chunk: ToolReturnMessage) => void, options?: {
    abortSignal?: AbortSignal;
    onStreamingOutput?: (toolCallId: string, chunk: string, isStderr?: boolean) => void;
    toolContextId?: string;
    workingDirectory?: string;
    parentScope?: {
        agentId: string;
        conversationId: string;
    };
    onFileWrite?: (filePath: string, content: string) => void;
}): Promise<ApprovalResult[]>;
/**
 * Helper to execute auto-allowed tools and map results to the format expected by App.tsx.
 * Consolidates the common pattern of converting approvals to decisions, executing them,
 * and mapping the results back.
 *
 * @param autoAllowed - Array of auto-allowed approval contexts (must have .approval property)
 * @param onChunk - Callback to update UI with tool results
 * @param options - Optional abort signal for cancellation
 * @returns Array of results with toolCallId and ToolExecutionResult
 */
export declare function executeAutoAllowedTools(autoAllowed: Array<{
    approval: ApprovalRequest;
}>, onChunk: (chunk: ToolReturnMessage) => void, options?: {
    abortSignal?: AbortSignal;
    onStreamingOutput?: (toolCallId: string, chunk: string, isStderr?: boolean) => void;
    toolContextId?: string;
    workingDirectory?: string;
    onFileWrite?: (filePath: string, content: string) => void;
}): Promise<AutoAllowedResult[]>;
//# sourceMappingURL=approval-execution.d.ts.map