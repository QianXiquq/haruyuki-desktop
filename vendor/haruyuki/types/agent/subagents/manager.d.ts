/**
 * Subagent manager for spawning and coordinating subagents
 *
 * This module handles:
 * - Spawning subagents via haruyuki CLI in headless mode
 * - Executing subagents and collecting final reports
 * - Managing parallel subagent execution
 */
import { type BackendMode } from "../../backend";
import { type SubagentConfig, type SubagentMemoryScope, type SubagentResult } from ".";
interface BuildSubagentArgsOptions {
    backendMode?: BackendMode;
    promptTransport?: "argv" | "stdin";
    /** Runtime platform override for launcher tests. */
    platform?: NodeJS.Platform;
    extraTools?: string[];
    parentAgentId?: string | null;
    /**
     * Replace the subagent's configured persona: pass `--system-custom <text>`
     * to the child instead of `--system <type>`. Only applies to new agents.
     */
    systemPromptOverride?: string;
    /**
     * Route the child's turn to a connected computer (`--computer`).
     * The child resolves the selector and fails fast if the device is offline,
     * ambiguous, or does not support environment-routed messaging.
     */
    environment?: string;
    /** Identity for the child's initial assignment, never inherited. */
    clientMessageId?: string;
}
/** Build CLI arguments for spawning a subagent. */
export declare function buildSubagentArgs(type: string, config: SubagentConfig, model: string | null, userPrompt: string, existingAgentId?: string, existingConversationId?: string, maxTurns?: number, options?: BuildSubagentArgsOptions): string[];
export declare function shouldPrependDeploySystemReminder(existingAgentId: string | undefined, parentAgentId: string): boolean;
export declare function recallPromptForBackend(backendMode?: BackendMode): string;
/**
 * Spawn a subagent and execute it autonomously
 *
 * @param type - Subagent type (e.g., "code-reviewer", "general-purpose")
 * @param prompt - The task prompt for the subagent
 * @param exactModelHandle - Optional exact model handle from a harness caller.
 *   Used verbatim — there is no resolution, catalogue lookup, tier default, or
 *   fallback. Omitted by every agent-facing launch, which runs the child on the
 *   parent conversation's model.
 * @param subagentId - ID for tracking in the state store (registered by Task tool)
 * @param signal - Optional abort signal for interruption handling
 * @param existingAgentId - Optional ID of an existing agent to deploy
 * @param existingConversationId - Optional conversation ID to resume
 * @param parentAgentId - Parent agent ID captured at the synchronous call
 *   site. Preferred over reading `getCurrentAgentId()` here because this
 *   function runs after several async yields and the in-process context
 *   may have drifted (e.g., the listener processing another agent's turn).
 */
declare function spawnSubagentInContext(type: string, prompt: string, exactModelHandle: string | undefined, subagentId: string, signal?: AbortSignal, existingAgentId?: string, existingConversationId?: string, maxTurns?: number, forkedContext?: boolean, parentAgentId?: string, transcriptPath?: string, parentConversationId?: string, memoryScope?: SubagentMemoryScope, systemPromptOverride?: string, environment?: string, resolvedConfig?: SubagentConfig, clientMessageId?: string): Promise<SubagentResult>;
export declare function spawnSubagent(...args: Parameters<typeof spawnSubagentInContext>): Promise<SubagentResult>;
export {};
//# sourceMappingURL=manager.d.ts.map