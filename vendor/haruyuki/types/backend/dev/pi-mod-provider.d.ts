import type { Api, Model, Provider } from "@earendil-works/pi-ai";
import type { PiProviderModelRegistration, PiProviderRegistration, RegisteredPiProvider } from "./pi-provider-mod-registry";
/**
 * Maps a mod's model registration to the complete pi-ai Model the provider
 * publishes. Connection-derived auth headers are intentionally not baked in:
 * they are per-request state resolved by pi-model-factory and passed as
 * stream options, which pi-ai merges over provider defaults.
 */
export declare function registrationModelToPiModel(input: {
    providerName: string;
    config: PiProviderRegistration;
    model: PiProviderModelRegistration;
    baseURL?: string;
    headers?: Record<string, string>;
}): Model<Api>;
export interface ModPiProviderOptions {
    registered: RegisteredPiProvider;
    storageDir?: string;
}
/**
 * Real pi-ai Provider for a mod-registered provider (LET-10130). The
 * declarative mod registration stays the mod-facing vocabulary; this adapter
 * turns it into the concrete runtime unit: statically declared models are
 * published as complete pi-ai Models, a mod `listModels` hook becomes the
 * provider's dynamic `refreshModels` (with last-known retention on failure,
 * seeded from the static declaration), and stream dispatch runs through the
 * provider's per-API implementations.
 */
export declare function createModPiProvider(options: ModPiProviderOptions): Provider;
//# sourceMappingURL=pi-mod-provider.d.ts.map