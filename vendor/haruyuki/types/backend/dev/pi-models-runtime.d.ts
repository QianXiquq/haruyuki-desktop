import type { Api, AssistantMessageEventStream, AuthResult, Context, Credential, Model, ModelsApiStreamOptions, ModelsSimpleStreamOptions } from "@earendil-works/pi-ai";
export interface LocalPiModelsRuntimeOptions {
    storageDir?: string;
    fetchImpl?: typeof fetch;
}
/**
 * Per-local-backend pi-ai Models runtime: the source of truth for provider
 * registration, model lookup, refresh, and stream dispatch in the local turn
 * path (LET-10126). One instance per LocalBackend — never module-global — so
 * concurrent agents with different storage dirs cannot share mutable provider
 * state.
 *
 * Built-in pi-ai providers are registered as-is. Local endpoint providers
 * that own dynamic discovery (Ollama LET-10127, Ollama Cloud, llama.cpp
 * LET-10128, LM Studio LET-10129) are rebuilt when their Letta-side
 * connection record (base URL/auth) changes; a change invalidates and
 * refreshes only that provider.
 */
export declare class LocalPiModelsRuntime {
    private readonly models;
    private readonly storageDir?;
    private readonly fetchImpl?;
    private readonly endpointSignatures;
    private readonly modSignatures;
    private readonly modelsStore;
    private readonly credentials;
    private readonly dynamicBuiltinIds;
    private readonly credentialSignatures;
    constructor(options?: LocalPiModelsRuntimeOptions);
    /**
     * Provider ids whose published catalog can vary with the stored account:
     * dynamic built-ins (e.g. Radius) plus mod providers with a `listModels`
     * hook. A mod registration owns its id either way — a static mod catalog
     * overriding a dynamic built-in id is not account-scoped.
     */
    private accountScopedProviderIds;
    /**
     * Account-scoped catalogs are invalidated when the stored credential's
     * identity changes: drop the persisted catalog and rebuild the provider so
     * one account's models cannot be listed — or resolved for a turn — while
     * requests authenticate as another. This covers OAuth account switches on
     * dynamic mods too, whose reconstruction signature (revision/base URL/API
     * key) cannot see OAuth credentials. Routine access-token refreshes keep
     * the identity (volatile `access`/`expires` fields are excluded), so they
     * do not clear last-known retention.
     */
    private invalidateOnCredentialChange;
    /**
     * Resolve request auth for a provider through the runtime: stored
     * credential (via the auth.json adapter, refreshing OAuth as needed) or
     * the provider's ambient sources.
     */
    getAuth(providerId: string): Promise<AuthResult | undefined>;
    /**
     * One consistent turn resolution: credential-identity invalidation, auth,
     * and model lookup happen against the same provider state, so a
     * credential change can never pair the new account's auth with a stale
     * account's cached model. On a model miss, dynamic catalogs refresh once.
     *
     * Account writes (logins) are not serialized against resolution, and
     * `Models.getAuth` performs its own credential read — so after resolving,
     * verify the stored identity is still the one the invalidation snapshot
     * validated the catalog against. If it moved mid-flight, invalidate and
     * retry with the new identity; if it is still moving when the retry
     * budget is exhausted, fail closed (throw) rather than return a pair
     * whose auth and catalog may come from different accounts.
     */
    resolveTurn(providerId: string, modelId: string, fallbackModelId?: string, abortSignal?: AbortSignal): Promise<{
        model: Model<Api> | undefined;
        auth: AuthResult | undefined;
    }>;
    /**
     * Detects an account switch that landed between the invalidation snapshot
     * and auth/catalog resolution. Only account-scoped providers have a
     * recorded identity to compare against — other catalogs do not vary by
     * account, so a mid-flight credential change cannot mismatch them.
     */
    private credentialIdentityMovedSinceInvalidation;
    /** Stored (possibly just-refreshed) credential for a provider. */
    getStoredCredential(providerId: string): Promise<Credential | undefined>;
    /** Providers whose models this runtime discovers and owns end-to-end. */
    isRuntimeManagedProvider(providerId: string): boolean;
    /** Built-in local Ollama daemon, excluding mods that override its id. */
    isBuiltInLocalOllamaProvider(providerId: string): boolean;
    /**
     * Registers/refreshes the pi-ai Provider for a mod registration. Returns
     * true when the provider id is (or was) mod-owned — mod registrations take
     * precedence over the built-in endpoint table, matching pi-model-factory's
     * resolution order. The per-name registry revision detects re-registration
     * so only the affected provider is rebuilt.
     */
    private ensureModProvider;
    private ensureEndpointProvider;
    private ensureManagedProviders;
    getModels(providerId?: string): readonly Model<Api>[];
    getModel(providerId: string, modelId: string): Model<Api> | undefined;
    /**
     * Canonical catalog refresh: pi-ai's Models.refresh resolves each dynamic
     * provider's effective credential (refreshing OAuth under the store lock),
     * supplies its store-backed RefreshModelsContext, and skips unconfigured
     * providers — so unconfigured remote endpoints and mod listModels hooks
     * are never probed, while keyless local daemons ("not-needed") and
     * credentialed dynamic built-ins (e.g. radius) refresh correctly.
     * Per-provider fetch failures keep that provider's last-known list.
     */
    refreshAll(): Promise<void>;
    /**
     * Refresh with per-provider error semantics: rejects with the given
     * provider's fetch error while the provider keeps serving its last-known
     * list.
     */
    refresh(providerId: string): Promise<void>;
    /**
     * Runtime model lookup for turn execution: last-known list first, then one
     * refresh attempt for dynamic providers when the model is absent. Returns
     * the same Model instance that listing published.
     */
    resolveModel(providerId: string, modelId: string): Promise<Model<Api> | undefined>;
    stream<TApi extends Api>(model: Model<TApi>, context: Context, options?: ModelsApiStreamOptions<TApi>): AssistantMessageEventStream;
    streamSimple(model: Model<Api>, context: Context, options?: ModelsSimpleStreamOptions): AssistantMessageEventStream;
}
//# sourceMappingURL=pi-models-runtime.d.ts.map