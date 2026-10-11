import type { ModelReasoningEffort } from "./model";
export type AvailableModel = {
    handle: string;
    label: string;
    supportsStructuredOutputs?: boolean;
    maxContextWindow?: number;
    maxOutputTokens?: number;
    providerType?: string;
    providerCategory?: string;
    modelEndpoint?: string;
    modelId?: string;
    openAICompatibleProxy?: boolean;
    reasoningLevels?: string[];
};
export type ReasoningCapabilities = {
    supported_efforts?: ModelReasoningEffort[] | null;
    mandatory?: boolean;
};
export type AvailableModelHandlesResult = {
    handles: Set<string>;
    providerTypes: Map<string, string>;
    openAICompatibleProxyHandles: Set<string>;
    models: AvailableModel[];
    source: "cache" | "network";
    fetchedAt: number;
};
export declare function clearAvailableModelsCache(): void;
export declare function getAvailableModelsCacheInfo(): {
    hasCache: boolean;
    isFresh: boolean;
    fetchedAt: number | null;
    ageMs: number | null;
    ttlMs: number;
};
/**
 * Return cached model handles if available.
 * Used by UI components to bootstrap from cache without showing a loading flash.
 */
export declare function getCachedModelHandles(): Set<string> | null;
/**
 * Return cached provider_type metadata by handle if available.
 * Used to carry backend model-catalog provider identity through selection
 * without re-listing models during model update mutations.
 */
export declare function getCachedModelProviderTypes(): Map<string, string> | null;
export declare function getCachedModelReasoningCapabilities(): Map<string, ReasoningCapabilities> | null;
export declare function getCachedOpenAICompatibleProxyHandles(): Set<string> | null;
export declare function getCachedAvailableModels(): AvailableModel[] | null;
export declare function getAvailableModelHandles(options?: {
    forceRefresh?: boolean;
}): Promise<AvailableModelHandlesResult>;
/**
 * Best-effort prefetch to warm the cache (no throw).
 * This is intentionally fire-and-forget.
 */
export declare function prefetchAvailableModelHandles(): void;
/**
 * Get the max_context_window for a model handle from the API.
 * Ensures the cache is populated before reading.
 * Returns undefined if handle not found in the API response.
 */
export declare function getModelContextWindow(handle: string): Promise<number | undefined>;
/**
 * Get provider_type metadata for a model handle from the cached API model list.
 * Ensures the shared cache is populated before reading.
 */
export declare function getModelProviderType(handle: string): Promise<string | undefined>;
//# sourceMappingURL=available-models.d.ts.map