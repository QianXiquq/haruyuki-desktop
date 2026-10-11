export type ErrorDisplaySurface = "plain" | "terminal";
export interface FormatErrorDetailsOptions {
    automaticRetry?: boolean;
    surface?: ErrorDisplaySurface;
    unclassifiedFallback?: "generic";
}
export declare function isCloudflareEdge52xHtmlError(text: string): boolean;
export declare function isCloudflareEdge52xErrorText(text: string): boolean;
export declare function checkCloudflareEdgeError(text: string): string | undefined;
/**
 * Normalize raw provider error payloads before sending to telemetry.
 * Keeps telemetry concise by collapsing Cloudflare HTML pages into a
 * single readable line while preserving non-Cloudflare messages as-is.
 */
export declare function formatTelemetryErrorMessage(message: string | null | undefined): string;
export declare function isProviderStreamDisconnectErrorText(text: string): boolean;
export declare function checkProviderStreamDisconnectError(text: string): string | undefined;
/**
 * Check if a string contains a ChatGPT usage_limit_reached error with optional
 * reset timing, and return a friendly message.
 *
 * ChatGPT wraps the error as embedded JSON inside a detail string like:
 *   RATE_LIMIT_EXCEEDED: ChatGPT rate limit exceeded: {"error":{"type":"usage_limit_reached",...}}
 */
export declare function checkChatGptUsageLimitError(text: string): string | undefined;
/**
 * Returns true if the error is an OpenAI encrypted content org mismatch.
 * Used by callers to skip generic error hints for this self-explanatory error.
 */
export declare function isEncryptedContentError(e: unknown): boolean;
/**
 * Extract comprehensive error details from any error object
 * Handles APIError, Error, and other error types consistently
 * @param e The error object to format
 * @param agentId Optional agent ID to create hyperlinks to the Letta dashboard
 * @param conversationId Optional conversation ID to include in agent links
 */
export declare function formatErrorDetails(e: unknown, agentId?: string, conversationId?: string, options?: FormatErrorDetailsOptions): string;
/**
 * Return a user-facing status message for a retriable LLM API error.
 * Matches known provider error patterns from the run's error detail and
 * returns a specific message; falls back to a generic one otherwise.
 */
export declare function getRetryStatusMessage(errorDetail: string | null | undefined): string | null;
//# sourceMappingURL=error-formatter.d.ts.map