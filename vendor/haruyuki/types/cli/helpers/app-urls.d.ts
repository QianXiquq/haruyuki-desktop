export declare function isLocalAgentId(agentId: string): boolean;
/**
 * Build a chat URL for an agent, with optional conversation and extra query params.
 */
export declare function buildChatUrl(agentId: string, options?: {
    conversationId?: string;
    view?: string;
    deviceId?: string;
}): string;
/**
 * Build the chat.letta.com desktop viewer URL for a sandbox desktop-session
 * relay URL. Chat reads the relay path and expiry from the hash, so they never
 * reach a server log as a query string. Anyone holding the result can view and
 * control the desktop until it expires.
 */
export declare function buildDesktopViewerUrl(relayUrl: string, expiresAt: string): string;
/**
 * Build a user-facing agent reference. API-backed agents can link to Chat,
 * but local-backend agents are not available there, so show the ID.
 */
export declare function buildAgentReference(agentId: string, options?: Parameters<typeof buildChatUrl>[1]): string;
/**
 * Build an OSC8 terminal hyperlink for API-backed agents, or plain text for
 * local-backend agents that do not exist in the web app.
 */
export declare function buildAgentTerminalLink(agentId: string, options?: Parameters<typeof buildChatUrl>[1], label?: string): string;
/**
 * Build a URL for a Chat preference or other non-agent Chat page.
 */
export declare function buildChatWebUrl(path: string): string;
//# sourceMappingURL=app-urls.d.ts.map