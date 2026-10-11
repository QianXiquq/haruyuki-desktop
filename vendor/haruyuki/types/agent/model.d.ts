import { getDefaultModel, models, resolveModel } from "./model-catalog";
import { type ModelConfigSnapshot } from "./model-handles";
export { getDefaultModel, models, resolveModel };
export { mapModelHandleToLlmConfigPatch, normalizeKnownModelHandle, normalizeModelHandleForRegistry, resolveModelHandleFromLlmConfig, } from "./model-handles";
export type ModelReasoningEffort = "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";
/** Null means use the upstream provider's default and omit reasoning_effort. */
export type ModelReasoningSelection = ModelReasoningEffort | null;
type ReasoningCapabilities = {
    supported_efforts?: ModelReasoningEffort[] | null;
    mandatory?: boolean;
};
export declare const CHATGPT_FAST_SERVICE_TIER = "priority";
export declare function isLocalModelHandle(modelHandle: string): boolean;
export declare function getLocalModelLabel(modelHandle: string): string;
export declare function isLocalChatGptOAuthModelHandle(modelHandle: string): boolean;
export declare function getChatGptFastRegistryHandleForModelHandle(modelHandle: string): string | null;
export declare function getReasoningTierOptionsForHandle(modelHandle: string, contextWindow?: number, reasoningCapabilities?: ReasoningCapabilities | null): Array<{
    effort: ModelReasoningEffort;
    modelId: string;
}>;
export declare function getReasoningTierOptionsFromCapabilities(modelHandle: string, capabilities?: ReasoningCapabilities | null): Array<{
    effort: ModelReasoningEffort;
    modelId: string;
}>;
export declare function withReasoningEffortUpdateArg(updateArgs: Record<string, unknown> | undefined, reasoningEffort: ModelReasoningSelection | undefined): Record<string, unknown> | undefined;
export declare function getByokOpenAIReasoningTierOptions(modelHandle: string, options?: {
    registryHandle?: string;
    contextWindow?: number;
    reasoningCapabilities?: ReasoningCapabilities | null;
}): Array<{
    effort: ModelReasoningSelection;
    modelId: string;
}>;
export declare function getPreferredReasoningOption<T extends {
    effort: ModelReasoningSelection;
}>(options: T[], selectedEffort: unknown): T | undefined;
/**
 * Get the default model handle based on billing tier.
 * All tiers use the same default selection path.
 * @param billingTier - The user's billing tier (e.g., "free", "pro", "enterprise")
 * @returns The model handle to use as default
 */
export declare function getDefaultModelForTier(billingTier?: string | null): string;
/**
 * Format available models for error messages
 */
export declare function formatAvailableModels(): string;
/**
 * Get model info by ID or handle
 * @param modelIdentifier - Can be either a model ID (e.g., "opus-4.5") or a full handle (e.g., "anthropic/claude-opus-4-5")
 * @returns The model info if found, null otherwise
 */
export declare function getModelInfo(modelIdentifier: string): import("./model-catalog").CatalogModel | null;
/**
 * Get model info by handle + llm_config.
 *
 * This exists because many model "tiers" (e.g. gpt-5.2-none/low/medium/high)
 * share the same handle and differ only by updateArgs like reasoning_effort.
 *
 * When resuming a session we want `/model` to highlight the tier that actually
 * matches the agent configuration.
 */
export declare function getModelInfoForLlmConfig(modelHandle: string, llmConfig?: {
    reasoning_effort?: string | null;
    enable_reasoner?: boolean | null;
    context_window?: number | null;
    service_tier?: string | null;
} | null): import("./model-catalog").CatalogModel | null;
/**
 * The server's legacy global context-window clamp
 * (`model_settings.global_max_context_window_limit`, default 128000). Any
 * model-bearing update that omitted `context_window_limit` historically got
 * its window clamped to this value regardless of the model's real window
 * (LET-9786).
 */
export declare const LEGACY_SERVER_CONTEXT_WINDOW_CLAMP = 128000;
/**
 * Return the current context window if it is safe to preserve across a
 * model-settings update, or undefined when it looks like the server's legacy
 * 128k clamp rather than a deliberate value.
 *
 * A value of exactly 128000 that matches no registry preset for the handle is
 * indistinguishable from server-clamp poisoning (LET-9786) — and poisoned
 * values are self-perpetuating if preserved. Callers should fall back to the
 * selected preset / catalog value when this returns undefined. Models whose
 * presets legitimately include 128000 (e.g. Codex Spark tiers) are preserved
 * normally.
 */
export declare function preservableContextWindow(current: number | null | undefined, modelHandle: string): number | undefined;
export declare function shouldPreserveContextWindowForModelSelection(input: {
    currentModelHandle?: string | null;
    currentModelId?: string | null;
    currentLlmConfig?: ModelConfigSnapshot | null;
    selectedModelHandle: string;
    selectedContextWindow?: number;
}): boolean;
/**
 * Get updateArgs for a model by ID or handle
 * @param modelIdentifier - Can be either a model ID (e.g., "opus-4.5") or a full handle (e.g., "anthropic/claude-opus-4-5")
 * @returns The updateArgs if found, undefined otherwise
 */
export declare function getModelUpdateArgs(modelIdentifier?: string): Record<string, unknown> | undefined;
type AgentModelSnapshot = {
    model?: string | null;
    llm_config?: {
        model?: string | null;
        model_endpoint_type?: string | null;
        reasoning_effort?: string | null;
        enable_reasoner?: boolean | null;
    } | null;
};
/**
 * Resolve the current model preset + updateArgs for an existing agent.
 *
 * Used during startup/resume refresh to re-apply only preset-defined fields
 * (without requiring an explicit --model flag).
 */
export declare function getModelPresetUpdateForAgent(agent: AgentModelSnapshot): {
    modelHandle: string;
    updateArgs: Record<string, unknown>;
} | null;
/**
 * Build the subset of preset updateArgs that should be synced on resume,
 * and check whether the agent already has those values.
 *
 * Returns `{ updateArgs, needsUpdate }`:
 *  - `updateArgs` contains only the resume-scoped fields from the preset.
 *  - `needsUpdate` is false when the agent already matches, so the caller
 *    can skip the expensive PATCH.
 */
export declare function getResumeRefreshArgs(presetUpdateArgs: Record<string, unknown>, agent: {
    llm_config?: {
        max_tokens?: number | null;
    } | null;
    model_settings?: {
        parallel_tool_calls?: boolean;
    } | null;
}): {
    updateArgs: Record<string, unknown>;
    needsUpdate: boolean;
};
/**
 * Get a display-friendly name for a model by its handle
 * @param handle - The full model handle (e.g., "anthropic/claude-sonnet-4-5-20250929")
 * @returns The display name (e.g., "Sonnet 4.5") if found, null otherwise
 */
export declare function getModelDisplayName(handle: string): string | null;
/**
 * Get a short display name for a model (for status bar)
 * Falls back to full label if no shortLabel is defined
 * @param handle - The full model handle
 * @returns The short name (e.g., "Opus 4.5 BR") if found, null otherwise
 */
export declare function getModelShortName(handle: string): string | null;
/**
 * Resolve a model ID from the llm_config.model value
 * The llm_config.model is the model portion without the provider prefix
 * (e.g., "z-ai/glm-4.6:exacto" for handle "openrouter/z-ai/glm-4.6:exacto")
 *
 * Note: This may not distinguish between variants like gpt-5.2-medium vs gpt-5.2-high
 * since they share the same handle. For provider fallback, this is acceptable.
 *
 * @param llmConfigModel - The model value from agent.llm_config.model
 * @returns The model ID if found, null otherwise
 */
export declare function resolveModelByLlmConfig(llmConfigModel: string): string | null;
//# sourceMappingURL=model.d.ts.map