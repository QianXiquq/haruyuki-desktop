export interface ChatGPTOAuthConfig {
    access_token: string;
    id_token: string;
    refresh_token?: string;
    account_id: string;
    expires_at: number;
}
export declare function isChatGPTOAuthConfig(value: unknown): value is ChatGPTOAuthConfig;
//# sourceMappingURL=chatgpt-oauth.d.ts.map