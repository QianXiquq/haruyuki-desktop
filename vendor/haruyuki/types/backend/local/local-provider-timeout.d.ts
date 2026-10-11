export type LocalProviderTimeout = number | false;
export declare const DEFAULT_LOCAL_PROVIDER_TIMEOUT_MS: number;
export declare function parseLocalProviderTimeout(value: string | undefined): LocalProviderTimeout | undefined;
export declare function resolveLocalProviderTimeout(options: {
    configuredTimeout?: LocalProviderTimeout;
    providerIds?: readonly string[];
    fallback?: LocalProviderTimeout;
}): LocalProviderTimeout;
export declare function createLocalProviderFetch(options: {
    fetch?: typeof fetch;
    timeout?: LocalProviderTimeout;
}): typeof fetch;
export declare function formatLocalProviderTimeout(timeout: LocalProviderTimeout): string;
//# sourceMappingURL=local-provider-timeout.d.ts.map