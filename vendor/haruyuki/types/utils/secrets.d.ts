export declare function getSecretValue(name: string, label: string): Promise<string | null>;
export declare function setSecretValue(name: string, value: string): Promise<void>;
export declare function deleteSecretValue(name: string): Promise<boolean>;
/**
 * Override the keychain service name (useful for tests to avoid touching real credentials)
 */
export declare function setServiceName(name: string): void;
export interface SecureTokens {
    apiKey?: string;
    refreshToken?: string;
}
/**
 * Store API key in system secrets
 */
export declare function setApiKey(apiKey: string): Promise<void>;
/**
 * Retrieve API key from system secrets
 */
export declare function getApiKey(): Promise<string | null>;
/**
 * Store refresh token in system secrets
 */
export declare function setRefreshToken(refreshToken: string): Promise<void>;
/**
 * Retrieve refresh token from system secrets
 */
export declare function getRefreshToken(): Promise<string | null>;
/**
 * Get both tokens from secrets
 */
export declare function getSecureTokens(): Promise<SecureTokens>;
/**
 * Store both tokens in secrets
 */
export declare function setSecureTokens(tokens: SecureTokens): Promise<void>;
/**
 * Remove API key from system secrets
 */
export declare function deleteApiKey(): Promise<void>;
/**
 * Remove refresh token from system secrets
 */
export declare function deleteRefreshToken(): Promise<void>;
/**
 * Remove all tokens from system secrets
 */
export declare function deleteSecureTokens(): Promise<void>;
/**
 * Check if secrets API is available
 * Set HARUYUKI_SKIP_KEYCHAIN_CHECK=1 to skip the check (useful in CI/test environments)
 */
export declare function isKeychainAvailable(): Promise<boolean>;
export declare function __resetSecretWarningStateForTests(): void;
export declare function __setSecretGetOverrideForTests(override: ((options: {
    service: string;
    name: string;
}) => Promise<string | null>) | null): void;
//# sourceMappingURL=secrets.d.ts.map