/** Per-file byte cap. The active file rotates once it reaches this size. */
export declare const MAX_FEEDBACK_LOG_BYTES: number;
/** Retained files, active file included: worst case 10 files x 10 MB. */
export declare const MAX_FEEDBACK_LOG_FILES = 10;
export interface FeedbackLogOptions {
    /** Override the log directory (tests). Defaults to `~/.haruyuki/logs`. */
    dir?: string;
    /** Override the per-file byte cap (tests). */
    maxBytes?: number;
    /** Override the retained file count, active file included (tests). */
    maxFiles?: number;
}
/** Absolute path of the file this module appends to. */
export declare function localFeedbackLogPath(options?: FeedbackLogOptions): string;
/**
 * Append one JSON line holding the submission payload. Never throws, never
 * blocks on the network.
 */
export declare function appendLocalFeedback(entry: Record<string, unknown>, options?: FeedbackLogOptions): void;
//# sourceMappingURL=local-feedback-log.d.ts.map