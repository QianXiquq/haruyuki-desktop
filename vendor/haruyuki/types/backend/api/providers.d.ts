export interface ProviderResponse {
    id: string;
    name: string;
    provider_type: string;
    provider_category?: "base" | "byok" | null;
    auth_type?: "api" | "oauth";
    api_key?: string;
    base_url?: string;
    timeout?: number | false;
    access_key?: string;
    region?: string;
}
export declare function listProviders(): Promise<ProviderResponse[]>;
export declare function getProviderByName(providerName: string): Promise<ProviderResponse | null>;
export declare function checkProviderApiKey(providerType: string, apiKey: string, accessKey?: string, region?: string, profile?: string, baseURL?: string): Promise<void>;
export declare function createProvider(providerType: string, providerName: string, apiKey: string, accessKey?: string, region?: string, profile?: string, baseURL?: string): Promise<ProviderResponse>;
export declare function updateProvider(providerId: string, apiKey: string, accessKey?: string, region?: string, profile?: string, baseURL?: string): Promise<ProviderResponse>;
export declare function deleteProvider(providerId: string): Promise<void>;
export declare function createOrUpdateProvider(providerType: string, providerName: string, apiKey: string, accessKey?: string, region?: string, profile?: string, baseURL?: string): Promise<ProviderResponse>;
export declare function removeProviderByName(providerName: string): Promise<void>;
//# sourceMappingURL=providers.d.ts.map