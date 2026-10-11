import type { OAuthCredentials } from "@earendil-works/pi-ai/oauth";
import type { ProviderResponse } from "../api/providers";
import type { LocalProviderTimeout } from "./local-provider-timeout";
export { LOCAL_ANTHROPIC_PROVIDER_NAME, LOCAL_BEDROCK_PROVIDER_NAME, LOCAL_CHATGPT_PROVIDER_NAME, LOCAL_GOOGLE_AI_PROVIDER_NAME, LOCAL_KIMI_CODE_PROVIDER_NAME, LOCAL_LLAMA_CPP_PROVIDER_NAME, LOCAL_LMSTUDIO_PROVIDER_NAME, LOCAL_MINIMAX_PROVIDER_NAME, LOCAL_MOONSHOT_PROVIDER_NAME, LOCAL_OLLAMA_CLOUD_PROVIDER_NAME, LOCAL_OLLAMA_PROVIDER_NAME, LOCAL_OPENAI_COMPATIBLE_PROVIDER_NAME, LOCAL_OPENAI_PROVIDER_NAME, LOCAL_OPENROUTER_PROVIDER_NAME, LOCAL_ZAI_CODING_PROVIDER_NAME, LOCAL_ZAI_PROVIDER_NAME, } from "../dev/pi-provider-registry";
export type LocalProviderAuthType = "api" | "oauth";
export interface LocalProviderApiAuth {
    type: "api";
    key: string;
}
export interface LocalProviderOAuthAuth {
    type: "oauth";
    access: string;
    refresh?: string;
    idToken?: string;
    expires: number;
    accountId?: string;
    [key: string]: unknown;
}
export type LocalProviderAuth = LocalProviderApiAuth | LocalProviderOAuthAuth;
export declare const LOCAL_PROVIDER_NO_API_KEY = "not-needed";
export interface LocalProviderRecord {
    id: string;
    name: string;
    provider_type: string;
    provider_category: "byok";
    auth: LocalProviderAuth;
    access_key?: string;
    region?: string;
    profile?: string;
    base_url?: string;
    timeout?: LocalProviderTimeout;
    created_at: string;
    updated_at: string;
}
export declare function isLocalProviderTypeSupported(providerType: string): boolean;
export declare function getLocalProviderAuthPath(storageDir?: string): string;
export declare function localProviderApiKeyFromRecord(record: LocalProviderRecord | null | undefined): string | undefined;
export declare function listLocalProviderRecords(storageDir?: string): LocalProviderRecord[];
export declare function listLocalProviders(storageDir?: string): Promise<ProviderResponse[]>;
export declare function getLocalProviderRecordByName(providerName: string, storageDir?: string): LocalProviderRecord | null;
export declare function getLocalProviderRecordByType(providerType: string, storageDir?: string): LocalProviderRecord | null;
export declare function getLocalProviderByName(providerName: string, storageDir?: string): Promise<ProviderResponse | null>;
export declare function createOrUpdateLocalProvider(input: {
    providerType: string;
    providerName: string;
    apiKey: string;
    accessKey?: string;
    region?: string;
    profile?: string;
    baseURL?: string;
    timeout?: LocalProviderTimeout;
    storageDir?: string;
}): Promise<ProviderResponse>;
export declare function updateLocalProvider(providerIdValue: string, apiKey: string, accessKey?: string, region?: string, profile?: string, storageDir?: string, options?: {
    baseURL?: string;
    timeout?: LocalProviderTimeout;
}): Promise<ProviderResponse>;
export declare function deleteLocalProvider(providerIdValue: string, storageDir?: string): Promise<void>;
export declare function removeLocalProviderByName(providerName: string, storageDir?: string): Promise<void>;
export declare function getLocalProviderApiKeyByName(providerName: string, storageDir?: string): string | undefined;
export declare function getLocalProviderApiKeyByType(providerType: string, storageDir?: string): string | undefined;
export declare function getLocalChatGPTOAuth(storageDir?: string): LocalProviderOAuthAuth | undefined;
export declare function setLocalChatGPTOAuth(auth: LocalProviderOAuthAuth, storageDir?: string): void;
export declare function setLocalOAuthProvider(input: {
    providerName: string;
    providerType: string;
    auth: LocalProviderOAuthAuth;
    storageDir?: string;
    baseURL?: string;
    timeout?: LocalProviderTimeout;
}): void;
export declare function localOAuthAuthFromCredentials(credentials: OAuthCredentials): LocalProviderOAuthAuth;
export declare function getLocalOAuthCredentials(providerNames: readonly string[], storageDir?: string): OAuthCredentials | undefined;
export declare function getLocalOAuthApiKey(input: {
    providerId: string;
    providerNames: readonly string[];
    storageDir?: string;
}): Promise<{
    apiKey: string;
    credentials: OAuthCredentials;
    baseUrl?: string;
    headers?: Record<string, string>;
} | undefined>;
export declare function getLocalChatGPTApiKey(storageDir?: string): Promise<string | undefined>;
//# sourceMappingURL=local-provider-auth-store.d.ts.map