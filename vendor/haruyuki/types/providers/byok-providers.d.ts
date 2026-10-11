/**
 * BYOK (Bring Your Own Key) Provider Service
 * Unified module for managing custom LLM provider connections
 */
import { type ProviderResponse } from "../backend/api/providers";
import { PROVIDER_TYPE_TO_BASE_PROVIDER } from "../backend/dev/pi-provider-registry";
import type { LocalProviderTimeout } from "../backend/local/local-provider-timeout";
export type { ProviderResponse } from "../backend/api/providers";
export type ProviderStorageTarget = "api" | "local";
export interface ProviderConnectionOptions {
    baseURL?: string;
    timeout?: LocalProviderTimeout;
}
export interface ProviderOperationOptions {
    target?: ProviderStorageTarget;
    connection?: ProviderConnectionOptions;
}
export interface ProviderField {
    key: string;
    label: string;
    placeholder?: string;
    secret?: boolean;
    required?: boolean;
}
export interface AuthMethod {
    id: string;
    label: string;
    description: string;
    fields: ProviderField[];
}
export interface ByokProvider {
    id: string;
    displayName: string;
    description: string;
    providerType: string;
    providerName: string;
    providerNames?: readonly string[];
    isOAuth?: boolean;
    oauthProviderId?: string;
    requiresApiKey?: boolean;
    defaultApiKey?: string;
    fields?: ProviderField[];
    authMethods?: AuthMethod[];
}
export type ByokProviderId = string;
export declare const CLOUD_BYOK_PROVIDERS: readonly ByokProvider[];
export declare const BYOK_PROVIDERS: readonly ByokProvider[];
export declare function getProviderConfigs(target?: ProviderStorageTarget): readonly ByokProvider[];
export declare function defaultProviderApiKey(provider: ByokProvider): string | undefined;
export declare function isLocalProviderStoreEnabled(): boolean;
export declare function defaultProviderStorageTarget(): ProviderStorageTarget;
export declare function providerStorageTargetLabel(target?: ProviderStorageTarget): string;
/** Prefixes that always indicate a BYOK handle (subscription aliases + lc-* providers) */
export declare const STATIC_BYOK_PROVIDER_PREFIXES: string[];
export { PROVIDER_TYPE_TO_BASE_PROVIDER };
/**
 * Build a mapping of BYOK provider names → base provider strings.
 *
 * Default aliases are derived from both Letta Cloud and local provider
 * metadata so all built-in providers are covered. Connected providers are
 * layered on top to support custom provider names.
 */
export declare function buildOpenAICompatibleProxyProviderNames(connectedProviders: Array<Pick<ProviderResponse, "name" | "provider_type" | "provider_category" | "base_url">>): Set<string>;
export declare function buildByokProviderAliases(connectedProviders?: Array<Pick<ProviderResponse, "name" | "provider_type">>, target?: ProviderStorageTarget): Record<string, string>;
/**
 * Check whether a model handle belongs to a BYOK provider.
 * Matches static prefixes (subscription aliases + lc-* providers) and any
 * provider name present in the alias map.
 */
export declare function isByokHandleForSelector(handle: string, byokProviderAliases: Record<string, string>): boolean;
/**
 * List all BYOK providers for the target store.
 */
export declare function listProviders(options?: ProviderOperationOptions): Promise<ProviderResponse[]>;
/**
 * Get a map of connected providers by name.
 */
export declare function getConnectedProviders(options?: ProviderOperationOptions): Promise<Map<string, ProviderResponse>>;
/**
 * Check if a specific BYOK provider is connected.
 */
export declare function isProviderConnected(providerName: string, options?: ProviderOperationOptions): Promise<boolean>;
/**
 * Get a provider by name.
 */
export declare function getProviderByName(providerName: string, options?: ProviderOperationOptions): Promise<ProviderResponse | null>;
/**
 * Validate an API key with the provider's check endpoint.
 * Returns true if valid, throws error if invalid.
 */
export declare function checkProviderApiKey(providerType: string, apiKey: string, accessKey?: string, region?: string, profile?: string, options?: ProviderOperationOptions): Promise<void>;
/**
 * Create a new BYOK provider.
 */
export declare function createProvider(providerType: string, providerName: string, apiKey: string, accessKey?: string, region?: string, profile?: string, options?: ProviderConnectionOptions, operationOptions?: ProviderOperationOptions): Promise<ProviderResponse>;
/**
 * Update an existing provider's API key.
 */
export declare function updateProvider(providerId: string, apiKey: string, accessKey?: string, region?: string, profile?: string, storageDirOrOptions?: string | ProviderOperationOptions, options?: ProviderConnectionOptions): Promise<ProviderResponse>;
/**
 * Delete a provider by ID.
 */
export declare function deleteProvider(providerId: string, options?: ProviderOperationOptions): Promise<void>;
/**
 * Create or update a BYOK provider.
 * If provider exists, updates the API key; otherwise creates new.
 */
export declare function createOrUpdateProvider(providerType: string, providerName: string, apiKey: string, accessKey?: string, region?: string, profile?: string, options?: ProviderConnectionOptions, operationOptions?: ProviderOperationOptions): Promise<ProviderResponse>;
/**
 * Remove a provider by name.
 */
export declare function removeProviderByName(providerName: string, options?: ProviderOperationOptions): Promise<void>;
/**
 * Get provider config by ID for a target.
 */
export declare function getProviderConfig(id: ByokProviderId, target?: ProviderStorageTarget): ByokProvider | undefined;
export declare function isXaiOAuthProvider(provider: ByokProvider): boolean;
//# sourceMappingURL=byok-providers.d.ts.map