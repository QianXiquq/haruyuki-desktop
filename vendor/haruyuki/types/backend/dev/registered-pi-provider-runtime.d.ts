import { type LocalProviderRecord } from "../local/local-provider-auth-store";
import { type LocalProviderTimeout } from "../local/local-provider-timeout";
import type { PiProviderModelRegistration, RegisteredPiProvider } from "./pi-provider-mod-types";
export interface RegisteredPiProviderRuntimeConnection {
    apiKey?: string;
    baseURL?: string;
    timeout: LocalProviderTimeout;
    headers?: Record<string, string>;
    record?: LocalProviderRecord;
}
interface RegisteredPiProviderModelListConnection {
    apiKey?: string;
    baseUrl?: string;
    baseURL?: string;
    headers?: Record<string, string>;
}
export declare function getRegisteredPiProviderLocalNames(provider: RegisteredPiProvider): readonly string[];
export declare function findRegisteredPiProviderLocalRecord(provider: RegisteredPiProvider, records: readonly LocalProviderRecord[]): LocalProviderRecord | undefined;
export declare function getRegisteredPiProviderLocalRecord(provider: RegisteredPiProvider, storageDir?: string): LocalProviderRecord | null;
export declare function isRegisteredPiProviderConfigured(provider: RegisteredPiProvider, records: readonly LocalProviderRecord[]): boolean;
export declare function resolveRegisteredPiProviderRuntimeConnection(provider: RegisteredPiProvider, storageDir?: string): RegisteredPiProviderRuntimeConnection;
export declare function listRegisteredPiProviderModels(provider: RegisteredPiProvider, connection: RegisteredPiProviderModelListConnection): Promise<PiProviderModelRegistration[]>;
export {};
//# sourceMappingURL=registered-pi-provider-runtime.d.ts.map