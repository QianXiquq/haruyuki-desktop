/**
 * The local backend's own "this turn cannot be sent" verdict.
 *
 * Distinct from a provider-reported overflow: the request was never sent, so
 * the numbers behind the decision are known. It is still an overflow for every
 * classifier, which is what keeps it non-retryable and actionable.
 */
export declare class LocalContextOverflowError extends Error {
    constructor(message: string);
}
/**
 * What the operator can do about an overflow. Appended to every overflow report.
 *
 * The second sentence is not padding: the first is a dead end whenever the
 * conversation has no marker to cut at, or its markers define no block inside the
 * current context. A bare `/compact` still compresses by the rate there — the
 * rate is a share of the transcript, not a threshold it must exceed — so the
 * report points at a command that always has something to do, and `/topic` is
 * how the operator makes the cut land on a topic edge instead.
 */
export declare const CONTEXT_OVERFLOW_GUIDANCE = "Run /compact to compress the older part of the conversation. This product no longer splits context automatically. Mark a boundary with /topic <title> when you want the cut to land on a topic edge.";
/** Report for an overflow the provider reported, where the numbers are unknown. */
export declare const CONTEXT_OVERFLOW_MESSAGE = "Context has exceeded the model window. Run /compact to compress the older part of the conversation. This product no longer splits context automatically. Mark a boundary with /topic <title> when you want the cut to land on a topic edge.";
export declare function isContextWindowOverflowError(error: unknown): boolean;
//# sourceMappingURL=context-window-overflow.d.ts.map