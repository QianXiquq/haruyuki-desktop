/**
 * OAuth 2.0 utilities for Letta Cloud authentication.
 *
 * Only the refresh path survives in this fork: the device-code login flow,
 * token revocation and credential probing had no production caller once the
 * hosted backend was removed (the local backend owns credentials on disk).
 * `HARUYUKI_CLOUD_API_URL`, `OAUTH_CONFIG` and `refreshAccessToken` are live —
 * the first names the legacy Cloud namespace key, the last is what the API
 * client and the provider usage query refresh through.
 */
export declare const HARUYUKI_CLOUD_API_URL = "https://api.letta.com";
export declare const OAUTH_CONFIG: {
    readonly clientId: "ci-let-724dea7e98f4af6f8f370f4b1466200c";
    readonly clientSecret: "";
    readonly authBaseUrl: "https://app.letta.com";
    readonly apiBaseUrl: "https://api.letta.com";
};
export interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
    scope?: string;
}
export declare class OAuthRefreshError extends Error {
    readonly retryable: boolean;
    readonly status?: number;
    readonly oauthCode?: string;
    constructor(message: string, options: {
        retryable: boolean;
        status?: number;
        oauthCode?: string;
        cause?: unknown;
    });
}
/**
 * Refresh an access token using a refresh token
 */
export declare function refreshAccessToken(refreshToken: string, deviceId: string, deviceName?: string): Promise<TokenResponse>;
//# sourceMappingURL=oauth.d.ts.map