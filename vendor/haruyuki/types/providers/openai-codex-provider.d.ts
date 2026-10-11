/**
 * ChatGPT OAuth provider management backed by the active provider store.
 * API mode stores a chatgpt_oauth provider on Letta; local mode stores OAuth
 * tokens in the local provider auth file and uses a local fetch shim at runtime.
 */
import type { ChatGPTOAuthConfig } from "../types/chatgpt-oauth";
export type { ChatGPTOAuthConfig } from "../types/chatgpt-oauth";
import { listProviders, type ProviderOperationOptions, type ProviderResponse } from "./byok-providers";
import { OPENAI_CODEX_PROVIDER_NAME } from "./openai-codex-constants";
export { listProviders };
export { OPENAI_CODEX_PROVIDER_NAME };
export declare const CHATGPT_OAUTH_PROVIDER_TYPE = "chatgpt_oauth";
export declare function normalizeChatGPTOAuthProviderName(providerName?: string | null): string;
interface EligibilityCheckResult {
    eligible: boolean;
    billing_tier: string;
    reason?: string;
}
/**
 * Get the chatgpt-plus-pro provider if it exists
 */
export declare function getOpenAICodexProvider(options?: ProviderOperationOptions, providerName?: string): Promise<ProviderResponse | null>;
/**
 * Create a new ChatGPT OAuth provider
 * OAuth config is JSON-encoded in api_key field for API-mode compatibility.
 */
export declare function createOpenAICodexProvider(config: ChatGPTOAuthConfig, options?: ProviderOperationOptions, providerName?: string): Promise<ProviderResponse>;
/**
 * Update an existing ChatGPT OAuth provider with new OAuth config
 * OAuth config is JSON-encoded in api_key field for API-mode compatibility.
 */
export declare function updateOpenAICodexProvider(providerId: string, config: ChatGPTOAuthConfig, options?: ProviderOperationOptions): Promise<ProviderResponse>;
/**
 * Create or update the ChatGPT OAuth provider
 * This is the main function called after successful /connect codex
 *
 * In API mode the Letta backend will:
 * 1. Store the OAuth tokens securely
 * 2. Handle token refresh when needed
 * 3. Transform requests from OpenAI format to ChatGPT backend format
 * 4. Add required headers (Authorization, ChatGPT-Account-Id, etc.)
 * 5. Forward to chatgpt.com/backend-api/codex
 */
export declare function createOrUpdateOpenAICodexProvider(config: ChatGPTOAuthConfig, options?: ProviderOperationOptions, providerName?: string): Promise<ProviderResponse>;
/**
 * Check if user is eligible for ChatGPT OAuth
 * Requires Pro or Enterprise billing tier
 */
export declare function checkOpenAICodexEligibility(): Promise<EligibilityCheckResult>;
//# sourceMappingURL=openai-codex-provider.d.ts.map