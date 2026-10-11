import type { Api, KnownProvider, Model } from "@earendil-works/pi-ai";
export declare const LOCAL_CHATGPT_PROVIDER_NAME = "chatgpt-plus-pro";
export declare const LOCAL_OPENAI_PROVIDER_NAME = "lc-openai";
export declare const LOCAL_OPENAI_COMPATIBLE_PROVIDER_NAME = "lc-openai-compatible";
export declare const OPENAI_COMPATIBLE_PI_PROVIDER_ID = "openai-compatible";
export declare const LOCAL_ANTHROPIC_PROVIDER_NAME = "lc-anthropic";
export declare const LOCAL_OPENROUTER_PROVIDER_NAME = "lc-openrouter";
export declare const LOCAL_OLLAMA_PROVIDER_NAME = "lc-ollama";
export declare const LOCAL_OLLAMA_CLOUD_PROVIDER_NAME = "lc-ollama-cloud";
export declare const LOCAL_LMSTUDIO_PROVIDER_NAME = "lc-lmstudio";
export declare const LMSTUDIO_OPENAI_PROVIDER_TYPE = "lmstudio_openai";
export declare const LEGACY_LMSTUDIO_PROVIDER_TYPE = "lmstudio";
export declare const LOCAL_LLAMA_CPP_PROVIDER_NAME = "lc-llama-cpp";
export declare const LOCAL_ZAI_PROVIDER_NAME = "lc-zai";
export declare const LOCAL_ZAI_CODING_PROVIDER_NAME = "lc-zai-coding";
export declare const LOCAL_MINIMAX_PROVIDER_NAME = "lc-minimax";
export declare const LOCAL_MOONSHOT_PROVIDER_NAME = "lc-moonshot";
export declare const LOCAL_KIMI_CODE_PROVIDER_NAME = "lc-kimi-code";
export declare const LOCAL_GOOGLE_AI_PROVIDER_NAME = "lc-gemini";
export declare const LOCAL_BEDROCK_PROVIDER_NAME = "lc-bedrock";
export type LocalEndpointProvider = "ollama" | "ollama-cloud" | "openai-compatible" | "lmstudio" | "llama-cpp";
export type PiProvider = KnownProvider | LocalEndpointProvider;
export interface PiProviderSpec {
    id: PiProvider;
    piProvider?: KnownProvider;
    providerTypes: readonly string[];
    handlePrefixes: readonly string[];
    localProviderNames: readonly string[];
    defaultModel?: string;
    defaultBaseURL?: string;
    apiKeyEnv?: () => string | undefined;
    baseUrlEnv?: () => string | undefined;
    fallbackApiKey?: string;
    headers?: () => Record<string, string> | undefined;
    localModelDiscovery?: "ollama" | "openai-compatible";
    autoDetectLocalEndpoint?: boolean;
    envConfigured?: () => boolean;
    createCustomModel?: boolean;
    catalogModelHandle?: (model: Model<Api>) => string | undefined;
}
/**
 * Static catalog models for a provider. Some pi-ai providers (e.g. "radius")
 * have purely dynamic catalogs and no generated MODELS entry; they read as
 * an empty catalog here.
 */
export declare function builtinCatalogModels(provider: KnownProvider): readonly Model<Api>[];
export declare const PI_TUI_DEFAULT_MODEL_IDS: Partial<Record<KnownProvider, string>>;
export declare const PI_TUI_DEFAULTLESS_PROVIDER_IDS: ReadonlySet<string>;
export declare const PI_PROVIDER_SPECS: readonly PiProviderSpec[];
export declare const SUPPORTED_LOCAL_PROVIDER_TYPES: ReadonlySet<string>;
export declare const KNOWN_PI_PROVIDERS: Set<PiProvider>;
export declare const PROVIDER_TYPE_TO_BASE_PROVIDER: Record<string, string>;
export declare function getPiProviderSpec(provider: PiProvider): PiProviderSpec;
export declare function isPiProvider(provider: string): provider is PiProvider;
export declare function expectedPiProviderList(): string;
export declare function resolveProviderFromModelHandle(model: string | undefined): PiProvider | undefined;
export declare function resolvePiModelIdentity(model: string | undefined): string | undefined;
export declare function isResolvablePiModelHandle(model: string | undefined): boolean;
export declare function resolveProviderFromProviderType(providerType: unknown): PiProvider | undefined;
export declare function stripProviderHandlePrefix(model: string | undefined, provider: PiProvider): string | undefined;
export declare function localProviderType(provider: PiProvider): string;
export declare function localModelHandle(provider: PiProvider, model: string): string;
export declare function resolveLocalModel(provider: PiProvider): string | undefined;
export declare function listConfiguredPiProviders(localProviderNames: ReadonlySet<string>): PiProvider[];
export declare function listCatalogModelsForProvider(provider: PiProvider): string[];
export declare function piProviderFromModel(modelHandle: string, modelSettings: Record<string, unknown>): PiProvider | undefined;
//# sourceMappingURL=pi-provider-registry.d.ts.map