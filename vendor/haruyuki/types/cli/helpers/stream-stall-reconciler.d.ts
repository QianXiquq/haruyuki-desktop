export type StreamStallReconciler = {
    /** (Re-)start the silence timer. Call at stream start and on every chunk. */
    arm: () => void;
    /** Cancel the timer. Call when the stream ends for any reason. */
    clear: () => void;
    /** True if the reconciler aborted the HTTP read. */
    fired: () => boolean;
};
export declare function createStreamStallReconciler(context: {
    getRunId: () => string | null;
    getStopReason: () => string | null;
    canResumeWithoutRunId: () => boolean;
    /** Fetch the run's current server-side status; may throw. */
    retrieveRunStatus: (runId: string, signal: AbortSignal) => Promise<string | null | undefined>;
    abortHttpRead: () => void;
}): StreamStallReconciler;
//# sourceMappingURL=stream-stall-reconciler.d.ts.map