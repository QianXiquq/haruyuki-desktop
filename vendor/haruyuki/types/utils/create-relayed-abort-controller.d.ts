export interface RelayedAbortController {
    controller: AbortController;
    signal: AbortSignal;
    cleanup: () => void;
}
/**
 * Create a per-request AbortController that relays aborts from a longer-lived
 * parent signal.
 *
 * Reusing the same long-lived signal across many streamed requests can cause
 * abort listeners from the underlying fetch/stream implementation to pile up on
 * the parent. Giving each request a fresh child signal keeps those listeners
 * scoped to the request instead.
 */
export declare function createRelayedAbortController(parentSignal?: AbortSignal): RelayedAbortController;
//# sourceMappingURL=create-relayed-abort-controller.d.ts.map