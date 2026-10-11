export interface OAuthCallbackServer {
    redirectUrl: string;
    expectedState: {
        value?: string;
    };
    waitForCode(): Promise<string>;
    close(): void;
}
export declare function startOAuthCallbackServer(preferredPort?: number): Promise<OAuthCallbackServer>;
export declare function callbackPort(redirectUrl?: string): number | undefined;
//# sourceMappingURL=mcp-oauth-callback.d.ts.map