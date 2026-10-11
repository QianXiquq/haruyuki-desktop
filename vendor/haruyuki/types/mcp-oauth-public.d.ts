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
/**
 * Abort-aware persistence for completed MCP OAuth credentials.
 * Implementations must reject promptly when `signal` aborts and must not apply
 * a write or delete after cancellation.
 */
export interface McpOAuthStorage {
    get(credentialKey: string, signal: AbortSignal): Promise<string | null | undefined>;
    set(credentialKey: string, value: string, signal: AbortSignal): Promise<void>;
    delete(credentialKey: string, signal: AbortSignal): Promise<unknown>;
}
/** Package-owned structural fetch shape for MCP OAuth network requests. */
export type McpOAuthFetch = (url: string | URL, init?: RequestInit) => Promise<Response>;
/** Options for one complete, single-flight MCP OAuth authorization. */
export interface AuthorizeMcpServerWithStorageOptions {
    /** Owning agent used to namespace the credential key. */
    agentId: string;
    /** Stable identity for the physical backend, account, and profile. */
    storageNamespace: string;
    storage: McpOAuthStorage;
    serverName: string;
    serverUrl: string;
    /**
     * Custom fetch used for the MCP transport plus OAuth discovery, dynamic
     * registration, token exchange, and authenticated MCP requests.
     */
    fetch?: McpOAuthFetch;
    openBrowser?: (url: string) => Promise<void>;
    onStatus?: (message: string) => void;
    signal?: AbortSignal;
}
/**
 * Authorize and validate one HTTP MCP server, then return importable credentials.
 *
 * Calls for the same storage namespace, agent, and server share one in-flight
 * SDK authorization lifecycle when they also use the same fetch function.
 * Distinct fetch functions never share a flight, so one caller cannot bypass
 * another caller's network policy. Aborting one subscriber does not interrupt
 * another; the underlying operation is cancelled when its final subscriber
 * leaves. A storage namespace must remain stable for wrappers around the same
 * physical backend and unique across physically distinct backends.
 */
export declare function authorizeMcpServerWithStorage(options: AuthorizeMcpServerWithStorageOptions): Promise<McpOAuthCredentialSnapshot>;
//# sourceMappingURL=mcp-oauth-public.d.ts.map