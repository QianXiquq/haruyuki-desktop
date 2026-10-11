import type { PiProviderRegistration, RegisteredPiProvider } from "./pi-provider-mod-types";
export type { PiProviderConnectConfig, PiProviderConnectField, PiProviderConnection, PiProviderInputType, PiProviderModelRegistration, PiProviderOAuthConfig, PiProviderOAuthDeviceCodeInfo, PiProviderOAuthLoginCallbacks, PiProviderRegistration, RegisteredPiProvider, } from "./pi-provider-mod-types";
type PiProviderRegistryListener = () => void;
export declare function getPiProviderRegistryRevision(): number;
/**
 * Monotonic per-provider registration revision. Bumps on every register or
 * unregister of that provider name, letting per-backend Models runtimes
 * detect that a registration changed and rebuild only that provider.
 */
export declare function getRegisteredPiProviderRevision(providerName: string): number;
export declare function subscribePiProviderRegistry(listener: PiProviderRegistryListener): () => void;
export declare function registerPiProvider(providerName: string, config: PiProviderRegistration, owner?: {
    id?: string;
    path?: string;
}): RegisteredPiProvider;
export declare function unregisterPiProvider(providerName: string, ownerId?: string): void;
export declare function unregisterPiProvidersForOwner(ownerId: string): void;
export declare function clearRegisteredPiProviders(): void;
export declare function getRegisteredPiProvider(providerName: string): RegisteredPiProvider | undefined;
export declare function listRegisteredPiProviders(): RegisteredPiProvider[];
export declare function resolveRegisteredPiProviderFromModelHandle(model: string | undefined): string | undefined;
export declare function stripRegisteredProviderHandlePrefix(model: string | undefined, providerName: string): string | undefined;
export declare function resolveRegisteredPiProviderApiKey(apiKey: string | undefined): string | undefined;
export declare function resolveRegisteredPiProviderHeaders(headers: PiProviderRegistration["headers"]): Record<string, string> | undefined;
//# sourceMappingURL=pi-provider-mod-registry.d.ts.map