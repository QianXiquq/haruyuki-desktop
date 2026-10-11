/**
 * Agent-scoped secret storage for Haruyuki.
 *
 * Every agent is local now: the API (Cloud) backend that used to own
 * server-side agent secrets is gone, so the optional backend secret-list method
 * has no implementer and the server-side branches here are provably dead.
 * Secrets live in the operating system credential manager when available, with
 * a local-backend file fallback for Node production. Both paths hydrate the
 * same in-memory cache for fast $SECRET_NAME substitution.
 *
 * The `…Server` function names are kept for now to avoid an identifier-only
 * rename across the WS handlers and command layer.
 */
type LocalSecretStorage = {
    delete: (name: string) => Promise<boolean>;
    get: (name: string, label: string) => Promise<string | null>;
    set: (name: string, value: string) => Promise<void>;
};
export declare function __testOverrideLocalSecretStorage(storage: LocalSecretStorage | null): void;
export declare function __testSeedSecretsCache(agentId: string, secrets: Record<string, string>): void;
/**
 * Initialize the agent-scoped secrets cache. Every agent is local now, so this
 * always reads the OS secure storage / local-backend file fallback.
 */
export declare function initSecretsFromServer(agentId: string): Promise<void>;
/**
 * Load secrets from the in-memory cache.
 * Returns an empty object if secrets have not been initialized yet.
 */
export declare function loadSecrets(agentId?: string): Record<string, string>;
/**
 * List all secret names (not values).
 */
export declare function listSecretNames(agentId?: string): string[];
/**
 * Refresh the cache from core, then return the full entries. Used by the
 * modal's `secret_list` WS handler to pre-populate the form.
 */
export declare function refreshAndListSecrets(agentIdArg?: string): Promise<Array<{
    key: string;
    value: string;
}>>;
/**
 * Apply a batch of secret mutations to local storage. Used by the modal's
 * `secret_apply` WS handler.
 *
 * @returns sorted final secret name list after the apply
 */
export declare function applySecretBatch(options: {
    set?: Record<string, string>;
    unset?: string[];
}, agentIdArg?: string): Promise<string[]>;
/**
 * Set an agent-scoped secret and update the in-memory cache.
 */
export declare function setSecretOnServer(key: string, value: string, agentIdArg?: string): Promise<void>;
/**
 * Delete an agent-scoped secret and update the in-memory cache.
 * @returns true if the secret existed and was deleted
 */
export declare function deleteSecretOnServer(key: string, agentIdArg?: string): Promise<boolean>;
/**
 * Clear the in-memory cache (useful for testing).
 */
export declare function clearSecretsCache(agentId?: string | null): void;
export {};
//# sourceMappingURL=secrets-store.d.ts.map