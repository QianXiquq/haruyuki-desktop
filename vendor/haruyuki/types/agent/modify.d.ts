import type { AgentState, AnthropicModelSettings, GoogleAIModelSettings, OpenAIModelSettings } from "@letta-ai/letta-client/resources/agents/agents";
import type { Conversation } from "@letta-ai/letta-client/resources/conversations/conversations";
import type { Backend } from "../backend";
import { type ModelReasoningSelection } from "./model";
type ModelSettings = OpenAIModelSettings | AnthropicModelSettings | GoogleAIModelSettings | Record<string, unknown>;
/**
 * Builds model_settings from updateArgs based on provider type.
 * Always ensures parallel_tool_calls is enabled.
 */
export declare function buildModelSettings(modelHandle: string, updateArgs?: Record<string, unknown>, localModelCatalog?: boolean): ModelSettings;
export declare const __modifyTestUtils: {
    buildModelSettings: typeof buildModelSettings;
    updateArgsForModelSettings: typeof updateArgsForModelSettings;
};
declare function updateArgsForModelSettings(updateArgs: Record<string, unknown> | undefined, options: {
    useBackendModelCatalog: boolean;
}): Record<string, unknown> | undefined;
/**
 * Updates an agent's model and model settings.
 *
 * Uses the new model_settings field instead of deprecated llm_config.
 *
 * @param agentId - The agent ID
 * @param modelHandle - The model handle (e.g., "anthropic/claude-sonnet-4-5-20250929")
 * @param updateArgs - Additional config args (context_window, reasoning_effort, enable_reasoner, etc.)
 * @returns The updated agent state from the server (includes llm_config and model_settings)
 */
export interface UpdateLLMConfigOptions {
    signal?: AbortSignal;
    /**
     * Context window to send explicitly. Wins over updateArgs.context_window
     * and catalog derivation on EVERY backend — including local backends, where
     * updateArgs.context_window is otherwise ignored in favor of the pi model
     * catalog. Preserve paths (reasoning cycles, resume refresh, conversation
     * carryover, same-variant /model changes) use this to re-send the current
     * window (LET-9786).
     */
    contextWindowOverride?: number;
}
export declare function updateAgentLLMConfig(agentId: string, modelHandle: string, updateArgs?: Record<string, unknown>, options?: UpdateLLMConfigOptions): Promise<AgentState>;
/**
 * Updates a conversation's model and model settings.
 *
 * Uses conversation-scoped model overrides so different conversations can
 * run with different models without mutating the agent's default model.
 *
 * @param conversationId - The conversation ID (or "default")
 * @param modelHandle - The model handle (e.g., "anthropic/claude-sonnet-4-5-20250929")
 * @param updateArgs - Additional config args (reasoning_effort, enable_reasoner, etc.)
 * @returns The updated conversation from the server
 */
export declare function updateConversationLLMConfig(conversationId: string, modelHandle: string, updateArgs?: Record<string, unknown>, options?: UpdateLLMConfigOptions): Promise<Conversation>;
export interface ModelConfigUpdate {
    /** Model handle, e.g. "anthropic/claude-opus-4-8". Omit to keep the current model. */
    model?: string;
    /** Reasoning effort tier. Omit to leave reasoning settings untouched. */
    reasoningEffort?: ModelReasoningSelection;
    /** Context window limit. Omit to leave the current limit untouched. */
    contextWindow?: number;
}
export type ModelConfigTarget = {
    scope: "agent";
    agentId: string;
} | {
    scope: "conversation";
    conversationId: string;
    agentId?: string | null;
};
/**
 * Applies a partial model-config update (model, reasoning effort, and/or context
 * window) without rebuilding settings the caller did not touch.
 *
 * - Only `contextWindow`: sends `context_window_limit` alone, preserving the
 *   current model and model_settings (including reasoning effort).
 * - `reasoningEffort` without `model`: resolves the current model handle so
 *   model_settings can be rebuilt for the right provider.
 * - `model` (with optional effort/context): rebuilds model_settings and derives
 *   a context window when one is not supplied, matching updateAgentLLMConfig.
 *
 * Routes through the supplied backend's updateAgent/updateConversation, so it
 * works for both local and cloud agents.
 */
export declare function updateModelConfig(backend: Backend, target: ModelConfigTarget, update: ModelConfigUpdate): Promise<void>;
/**
 * Recompile an agent's system prompt. This is the manual application point
 * (`/recompile`, exposed as `recompileConversation` on the backend): on the
 * local backend it is what applies a registered prefix change. Nothing calls it
 * automatically after memory writes — a memory commit only registers.
 *
 * @param conversationId - The conversation whose prompt should be recompiled
 * @param agentId - Agent id for the parent conversation
 * @param dryRun - Optional dry-run control
 * @param clientOverride - Optional injected client for tests
 * @returns The compiled system prompt returned by the API
 */
export declare function recompileAgentSystemPrompt(conversationId: string, agentId: string, dryRun?: boolean, clientOverride?: {
    conversations: {
        recompile: (conversationId: string, params: {
            dry_run?: boolean;
            agent_id?: string;
        }) => Promise<string>;
    };
}): Promise<string>;
export interface SystemPromptUpdateResult {
    success: boolean;
    message: string;
}
/**
 * Updates an agent's system prompt with raw content.
 *
 * @param agentId - The agent ID
 * @param systemPromptContent - The raw system prompt content to update
 * @returns Result with success status and message
 */
export declare function updateAgentSystemPromptRaw(agentId: string, systemPromptContent: string | null): Promise<SystemPromptUpdateResult>;
/**
 * Result from updating a system prompt on an agent
 */
export interface UpdateSystemPromptResult {
    success: boolean;
    message: string;
    agent: AgentState | null;
}
/**
 * Updates an agent's system prompt by ID or subagent name.
 * Resolves the ID to content, updates the agent, and returns the refreshed agent state.
 *
 * @param agentId - The agent ID to update
 * @param systemPromptId - System prompt ID (e.g., "codex") or subagent name (e.g., "recall")
 * @returns Result with success status, message, and updated agent state
 */
export declare function updateAgentSystemPrompt(agentId: string, systemPromptId: string): Promise<UpdateSystemPromptResult>;
/**
 * Updates an agent's system prompt to the memfs full-prompt variant when
 * the stored managed prompt hash is known. Custom prompts are already complete
 * and are left unchanged.
 *
 * MemFS cannot be disabled, so there is no path back to the standard variant.
 *
 * @param agentId - The agent ID to update
 * @returns Result with success status and message
 */
export declare function updateAgentSystemPromptMemfs(agentId: string): Promise<SystemPromptUpdateResult>;
export {};
//# sourceMappingURL=modify.d.ts.map