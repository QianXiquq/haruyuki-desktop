import type { Provider } from "@earendil-works/pi-ai";
export declare const OLLAMA_PI_PROVIDER_ID = "ollama";
export declare const OLLAMA_CLOUD_PI_PROVIDER_ID = "ollama-cloud";
/** Ollama assigns the `latest` tag when a model handle omits one. */
export declare function normalizeOllamaModelId(modelId: string): string;
export interface OllamaPiProviderOptions {
    /** Base URL as configured; `/v1` is appended/stripped as needed. */
    baseURL: string;
    apiKey?: string;
    fetchImpl?: typeof fetch;
    discoveryTimeoutMs?: number;
    /** Defaults to the local Ollama provider; Ollama Cloud reuses this factory. */
    providerId?: string;
    name?: string;
}
export declare function parseOllamaRunningContexts(data: unknown): Map<string, number>;
export interface ResolveOllamaServedContextOptions {
    baseURL: string;
    modelId: string;
    apiKey?: string;
    fetchImpl?: typeof fetch;
    signal?: AbortSignal;
    /** Defaults to `process.env`. Tests inject a fake env. */
    env?: Record<string, string | undefined>;
}
/**
 * Resolve turn-time serving truth for one exact Ollama model. Catalog metadata
 * cannot answer this for an unloaded model. A model already loaded by another
 * client can also use that client's `num_ctx`, while our OpenAI-compatible
 * request uses the daemon default. Use Ollama's documented empty generate
 * request to load the selected model with the same default our turn will use,
 * then require `/api/ps` to report that exact identity before dispatch.
 *
 * The generate request pins `keep_alive` so `OLLAMA_KEEP_ALIVE=0` cannot unload
 * the model before `/api/ps`. A missing `context_length` is not replaced with
 * GGUF metadata. `HARUYUKI_OLLAMA_CONTEXT_LENGTH` is the only override, and only
 * when the user states the window the daemon actually serves.
 */
export declare function resolveOllamaServedContext(options: ResolveOllamaServedContextOptions): Promise<number>;
/**
 * Real dynamic pi-ai Provider for an Ollama endpoint (local daemon or
 * Ollama Cloud — both speak the same native API). See
 * `createLocalEndpointPiProvider` for the shared refresh/auth semantics.
 */
export declare function createOllamaPiProvider(options: OllamaPiProviderOptions): Provider<"openai-completions">;
//# sourceMappingURL=pi-ollama-provider.d.ts.map