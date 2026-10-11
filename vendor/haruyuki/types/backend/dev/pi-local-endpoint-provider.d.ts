import type { Model, Provider } from "@earendil-works/pi-ai";
export declare const LOCAL_ENDPOINT_DEFAULT_CONTEXT_WINDOW = 128000;
export type LocalEndpointModel = Model<"openai-completions">;
/**
 * Engine metadata for one discovered model. `vision`/`thinking` left
 * undefined mean the engine did not report the capability — the model is
 * published conservatively (text-only, non-reasoning), never guessed from
 * the model name.
 */
export interface LocalEndpointModelMetadata {
    id: string;
    vision?: boolean;
    thinking?: boolean;
    /** Engine-reported available window; the shared builder applies its default cap. */
    contextLength?: number;
    /** Engine-specific output cap; defaults to the shared constant. */
    maxTokens?: number;
    /** Engine-specific OpenAI-compat overrides merged over the defaults. */
    compat?: Model<"openai-completions">["compat"];
}
export interface LocalEndpointDiscoveryContext {
    /** GET (or POST when `body` is set) returning parsed JSON; throws on !ok. */
    fetchJson(url: string, init?: {
        body?: unknown;
    }): Promise<unknown>;
    /** Engine-native base URL (no trailing `/v1`). */
    nativeBaseURL: string;
    /** OpenAI-compatible base URL (with `/v1`), used for turn requests. */
    openAIBaseURL: string;
    /**
     * Models from the last successful refresh, read from the pi-ai
     * ModelsStore — the single source of last-known retention.
     */
    lastKnown: ReadonlyMap<string, LocalEndpointModel>;
    /**
     * Engine metadata fingerprints (e.g. Ollama tag digests) from the
     * previous refresh, keyed by model id. Provider-instance-scoped: a
     * connection change rebuilds the provider and discards them. Engines use
     * this to skip expensive per-model metadata fetches when the installed
     * artifact is unchanged; it never stores Model/capability data.
     */
    metadataFingerprints: ReadonlyMap<string, string>;
    /** Fingerprints to persist for the next refresh; engines fill this in. */
    nextMetadataFingerprints: Map<string, string>;
    /** Builds the complete pi-ai Model from engine metadata. */
    buildModel(metadata: LocalEndpointModelMetadata): LocalEndpointModel;
}
export type LocalEndpointDiscover = (context: LocalEndpointDiscoveryContext) => Promise<LocalEndpointModel[]>;
export interface LocalEndpointPiProviderOptions {
    id: string;
    name: string;
    /** Base URL as configured; `/v1` is appended/stripped as needed. */
    baseURL: string;
    apiKey?: string;
    fetchImpl?: typeof fetch;
    discoveryTimeoutMs?: number;
    discover: LocalEndpointDiscover;
}
/** Strips a trailing `/v1` to reach the engine-native API surface. */
export declare function localEndpointNativeBaseURL(baseURL: string): string;
export declare function localEndpointOpenAIBaseURL(baseURL: string): string;
export declare function modelIdsFromOpenAICompatibleList(data: unknown): string[];
/**
 * Real dynamic pi-ai Provider for an OpenAI-compatible local engine. The
 * provider owns keyless/keyed auth, model discovery, complete Model
 * construction from authoritative engine metadata, and stream dispatch; the
 * same Model instance serves /model listing and turn execution.
 *
 * Only the `discover` callback is engine-specific: each engine exposes its
 * capability metadata on a different native API (Ollama `POST /api/show`,
 * llama.cpp `GET /props`, LM Studio `GET /api/v0/models`), so discovery is
 * a per-engine translation into `LocalEndpointModelMetadata`. Everything
 * else — timeout/auth handling, last-known retention on refresh failure,
 * provider wiring — is shared here.
 */
export declare function createLocalEndpointPiProvider(options: LocalEndpointPiProviderOptions): Provider<"openai-completions">;
//# sourceMappingURL=pi-local-endpoint-provider.d.ts.map