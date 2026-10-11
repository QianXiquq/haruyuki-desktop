import { type OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
interface McpServerConfigBase {
    name: string;
}
export interface StdioMcpServerConfig extends McpServerConfigBase {
    transport?: "stdio";
    command: string;
    args?: string[];
    env?: Record<string, string>;
    cwd?: string;
}
export interface HttpMcpServerConfig extends McpServerConfigBase {
    transport: "http";
    url: string;
    headers?: Record<string, string>;
}
export interface SseMcpServerConfig extends McpServerConfigBase {
    transport: "sse";
    url: string;
    headers?: Record<string, string>;
}
export type McpServerConfig = StdioMcpServerConfig | HttpMcpServerConfig | SseMcpServerConfig;
export interface McpToolDefinition {
    name: string;
    title?: string;
    description?: string;
    inputSchema: Record<string, unknown>;
    outputSchema?: Record<string, unknown>;
    annotations?: Record<string, unknown>;
    execution?: Record<string, unknown>;
    _meta?: Record<string, unknown>;
    icons?: Array<Record<string, unknown>>;
}
export interface McpToolResult {
    content: unknown[];
    isError?: boolean;
    structuredContent?: Record<string, unknown>;
    _meta?: Record<string, unknown>;
}
export interface ConnectedMcpServer {
    name: string;
    tools: McpToolDefinition[];
    callTool(name: string, args?: Record<string, unknown>, options?: {
        signal?: AbortSignal;
    }): Promise<McpToolResult>;
    close(): Promise<void>;
}
export interface McpOAuthConnection {
    authProvider: OAuthClientProvider;
    waitForAuthorizationCode?: () => Promise<string>;
    closeCallback?(): Promise<void>;
    close(): Promise<void>;
}
/** Package-owned structural fetch shape for MCP network requests. */
export type McpFetch = (url: string | URL, init?: RequestInit) => Promise<Response>;
export interface ConnectMcpServerOptions {
    clientInfo?: {
        name: string;
        version: string;
    };
    /** Custom fetch used for MCP transport and every SDK OAuth request. */
    fetch?: McpFetch;
    stderr?: "inherit" | "pipe";
    oauth?: McpOAuthConnection;
    signal?: AbortSignal;
}
/**
 * Connect to an MCP server from the client process and expose its tools through
 * a small transport-neutral interface suitable for SDK and channel adapters.
 */
export declare function connectMcpServer(config: McpServerConfig, options?: ConnectMcpServerOptions): Promise<ConnectedMcpServer>;
/** Start a stdio MCP server on the client machine. */
export declare function connectStdioMcpServer(config: StdioMcpServerConfig, options?: ConnectMcpServerOptions): Promise<ConnectedMcpServer>;
export {};
//# sourceMappingURL=mcp-client.d.ts.map