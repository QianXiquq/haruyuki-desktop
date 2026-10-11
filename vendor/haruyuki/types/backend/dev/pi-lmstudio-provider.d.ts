import type { Provider } from "@earendil-works/pi-ai";
export declare const LMSTUDIO_PI_PROVIDER_ID = "lmstudio";
export interface LmStudioPiProviderOptions {
    /** Base URL as configured; `/v1` is appended/stripped as needed. */
    baseURL: string;
    apiKey?: string;
    fetchImpl?: typeof fetch;
    discoveryTimeoutMs?: number;
}
/**
 * Real dynamic pi-ai Provider for an LM Studio server, replacing the Letta
 * connector that fabricated Models from name substrings. See
 * `createLocalEndpointPiProvider` for shared refresh/auth semantics.
 */
export declare function createLmStudioPiProvider(options: LmStudioPiProviderOptions): Provider<"openai-completions">;
//# sourceMappingURL=pi-lmstudio-provider.d.ts.map