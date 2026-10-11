import type { OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
/** Credentials produced by a completed MCP OAuth flow. */
export interface McpOAuthCredentialSnapshot {
    access_token: string;
    refresh_token?: string;
    client_id: string;
    client_secret?: string;
    redirect_uri: string;
    token_type?: string;
    /** Remaining access-token lifetime in seconds at export time. */
    expires_in?: number;
    scope?: string;
}
export interface McpOAuthSession {
    authProvider: OAuthClientProvider;
    waitForAuthorizationCode?: () => Promise<string>;
    closeCallback?(): Promise<void>;
    close(): Promise<void>;
}
export interface ExportableMcpOAuthSession extends McpOAuthSession {
    /** Export credentials after the MCP client finishes authorization. */
    exportCredentials(): Promise<McpOAuthCredentialSnapshot>;
}
/**
 * Async storage for completed MCP OAuth credentials.
 *
 * Discovery, dynamic registration, and PKCE verifier state remain scoped to an
 * active callback session and are committed together only after token exchange;
 * an interrupted browser flow starts over rather than attempting callback
 * recovery without its original loopback listener.
 */
export interface McpOAuthStorage {
    get(credentialKey: string): Promise<string | null | undefined>;
    set(credentialKey: string, value: string): Promise<void>;
    delete(credentialKey: string): Promise<unknown>;
}
export interface McpOAuthSessionOptions {
    interactive: boolean;
    onStatus?: (message: string) => void;
    openBrowser?: (url: string) => Promise<void>;
}
export interface StorageInjectedMcpOAuthSessionOptions {
    /** Consumer-owned opaque key, unique process-wide across storage backends. */
    credentialKey: string;
    /** Stable identity for wrappers around the same physical storage backend. */
    storageNamespace?: string;
    storage: McpOAuthStorage;
    interactive: boolean;
    openBrowser?: (url: string) => Promise<void>;
    onStatus?: (message: string) => void;
}
export declare function clearMcpOAuthCredentials(agentId: string, serverName: string, serverUrl: string): Promise<boolean>;
export declare function createMcpOAuthSession(agentId: string, serverName: string, serverUrl: string, options: McpOAuthSessionOptions): Promise<McpOAuthSession | undefined>;
export declare function createMcpOAuthSessionWithStorage(options: StorageInjectedMcpOAuthSessionOptions): Promise<ExportableMcpOAuthSession | undefined>;
export declare function mcpOAuthCredentialKey(agentId: string, serverName: string, serverUrl: string): string;
//# sourceMappingURL=mcp-oauth.d.ts.map