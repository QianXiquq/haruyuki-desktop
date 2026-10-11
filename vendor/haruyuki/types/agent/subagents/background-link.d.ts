/** Wait for a background subagent to publish a linkable agent or conversation. */
export declare function waitForBackgroundSubagentLink(subagentId: string, timeoutMs?: number | null, signal?: AbortSignal): Promise<void>;
/** Wait for a background subagent to publish its agent identity. */
export declare function waitForBackgroundSubagentAgentId(subagentId: string, timeoutMs?: number | null, signal?: AbortSignal): Promise<string | null>;
/** Wait for a background subagent to publish its conversation identity. */
export declare function waitForBackgroundSubagentConversationId(subagentId: string, timeoutMs?: number | null, signal?: AbortSignal): Promise<string | null>;
//# sourceMappingURL=background-link.d.ts.map