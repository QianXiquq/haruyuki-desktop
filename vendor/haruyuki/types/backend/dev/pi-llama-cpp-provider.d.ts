import type { Provider } from "@earendil-works/pi-ai";
export declare const LLAMA_CPP_PI_PROVIDER_ID = "llama-cpp";
export interface LlamaCppPiProviderOptions {
    /** Base URL as configured; `/v1` is appended/stripped as needed. */
    baseURL: string;
    apiKey?: string;
    fetchImpl?: typeof fetch;
    discoveryTimeoutMs?: number;
}
/**
 * Real dynamic pi-ai Provider for a llama.cpp server. Replaces the Letta
 * connector that fabricated Models from name substrings; mirrors upstream
 * Pi's first-class llama.cpp provider design (per-model engine metadata
 * owns capabilities). See `createLocalEndpointPiProvider` for shared
 * refresh/auth semantics.
 */
export declare function createLlamaCppPiProvider(options: LlamaCppPiProviderOptions): Provider<"openai-completions">;
//# sourceMappingURL=pi-llama-cpp-provider.d.ts.map