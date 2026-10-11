export type TerminalEofGuard = {
    /** (Re-)start the grace timer. Call on every chunk after stop_reason. */
    arm: () => void;
    /** Cancel the timer. Call when the stream ends for any reason. */
    clear: () => void;
    /** True if the guard aborted the HTTP read. */
    fired: () => boolean;
};
export declare function createTerminalEofGuard(context: {
    getStopReason: () => string | null;
    getRunId: () => string | null;
    abortHttpRead: () => void;
}): TerminalEofGuard;
//# sourceMappingURL=stream-terminal-eof-guard.d.ts.map