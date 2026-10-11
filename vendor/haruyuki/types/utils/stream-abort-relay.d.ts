export interface StreamAbortRelay {
    signal: AbortSignal;
    attach: (stream: object) => void;
    cleanup: () => void;
}
export declare function createStreamAbortRelay(parentSignal?: AbortSignal): StreamAbortRelay | null;
export declare function cleanupStreamAbortRelay(stream: object): void;
//# sourceMappingURL=stream-abort-relay.d.ts.map