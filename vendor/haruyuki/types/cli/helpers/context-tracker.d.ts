export declare const MAX_CONTEXT_HISTORY = 1000;
export type ContextTracker = {
    /** Most recent context_tokens from usage_statistics */
    lastContextTokens: number;
    /** History of context_tokens values for time-series display */
    contextTokensHistory: Array<{
        timestamp: number;
        tokens: number;
        turnId: number;
        compacted?: boolean;
    }>;
    /** Counter incremented once per user turn (before each stream drain) */
    currentTurnId: number;
    /** Set when a compaction event is seen; consumed by the next usage_statistics push */
    pendingCompaction: boolean;
    /** Set when compaction happens; consumed by the next user message to trigger memory reminder/spawn */
    pendingReflectionTrigger: boolean;
    /** Set when compaction completes; consumed to refresh conversation search metadata */
    pendingConversationDescriptionRegeneration: boolean;
    /**
     * The last context-pressure tier the user was told about, so a full context
     * does not repeat the same advisory line on every message. Cleared when the
     * context drops back under the soft threshold.
     */
    lastPressureNotice?: "soft" | "hard";
};
export declare function createContextTracker(): ContextTracker;
/** Reset token tracking (e.g. on agent/conversation switch). currentTurnId is monotonic. */
export declare function resetContextHistory(ct: ContextTracker): void;
//# sourceMappingURL=context-tracker.d.ts.map