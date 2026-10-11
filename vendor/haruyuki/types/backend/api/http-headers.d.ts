/**
 * Get standard headers for manual HTTP calls to Letta API.
 * Use this for any direct fetch() calls (not SDK calls).
 */
export declare function getHaruyukiHeaders(apiKey?: string): Record<string, string>;
/**
 * Get headers for MCP OAuth connections (includes Accept header for SSE).
 */
export declare function getMcpOAuthHeaders(apiKey: string): Record<string, string>;
//# sourceMappingURL=http-headers.d.ts.map