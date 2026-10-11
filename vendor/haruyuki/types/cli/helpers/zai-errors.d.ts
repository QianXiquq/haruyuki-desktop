/**
 * Z.ai-specific error detection, parsing, and formatting.
 *
 * Z.ai is an upstream LLM provider using the OpenAI-compatible API.
 * Errors arrive wrapped in generic "OpenAI" error messages from the server's
 * openai_client.py. This module extracts Z.ai's own error codes and presents
 * clear, actionable messages attributed to Z.ai.
 *
 * Z.ai error code ranges:
 *   1000-1004  Auth (authentication failed, token expired, invalid token)
 *   1100-1121  Account (inactive, locked, arrears, irregular activity)
 *   1200-1234  API call (invalid params, unsupported model, permissions, network)
 *   1300-1310  Rate/policy (content filtered, rate limit, quota, subscription expired)
 *   500        Internal server error
 */
/**
 * Parse a Z.ai error from an error detail string.
 * Returns the extracted code and message, or null if not a Z.ai error.
 */
export declare function parseZaiError(text: string): {
    code: number;
    message: string;
} | null;
/**
 * Format a Z.ai error code and message into a user-friendly string.
 */
export declare function formatZaiError(code: number, message: string): string;
/**
 * Check if an error string contains a Z.ai error. If so, return a formatted
 * user-friendly message; otherwise return undefined.
 */
export declare function checkZaiError(errorText: string): string | undefined;
/**
 * Returns true if the error detail contains a Z.ai error code in ranges that
 * should not be retried (auth, account, rate/policy).
 */
export declare function isZaiNonRetryableError(detail: string): boolean;
//# sourceMappingURL=zai-errors.d.ts.map