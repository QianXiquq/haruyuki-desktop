import type { Provider } from "@earendil-works/pi-ai";
export interface OpenAICompatiblePiProviderOptions {
    baseURL: string;
    apiKey?: string;
    fetchImpl?: typeof fetch;
    discoveryTimeoutMs?: number;
}
/**
 * Dynamic provider for an arbitrary OpenAI-compatible Chat Completions API.
 * The endpoint's /v1/models response owns model identity; capabilities remain
 * conservative because the OpenAI model-list schema does not report them.
 */
export declare function createOpenAICompatiblePiProvider(options: OpenAICompatiblePiProviderOptions): Provider<"openai-completions">;
//# sourceMappingURL=pi-openai-compatible-provider.d.ts.map