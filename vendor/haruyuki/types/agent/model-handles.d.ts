export type ModelConfigSnapshot = {
    model?: string | null;
    model_endpoint_type?: string | null;
    reasoning_effort?: string | null;
    enable_reasoner?: boolean | null;
    context_window?: number | null;
    service_tier?: string | null;
};
export declare const LOCAL_MODEL_HANDLE_PREFIXES: string[];
export declare const LOCAL_CHATGPT_OAUTH_HANDLE_PREFIX = "openai-codex/";
export declare const CHATGPT_OAUTH_LLM_CONFIG_PROVIDER = "chatgpt_oauth";
export declare function normalizeModelHandleForRegistry(modelHandle: string | null | undefined): string | null;
export declare function modelPortionFromHandle(modelHandle: string): string | null;
export declare function normalizeKnownModelHandle(modelHandle: string): string;
export declare function resolveModelHandleFromLlmConfig(llmConfig: ModelConfigSnapshot | null | undefined): string | null;
export declare function mapModelHandleToLlmConfigPatch(modelHandle: string, providerType?: string | null): Pick<ModelConfigSnapshot, "model" | "model_endpoint_type">;
//# sourceMappingURL=model-handles.d.ts.map