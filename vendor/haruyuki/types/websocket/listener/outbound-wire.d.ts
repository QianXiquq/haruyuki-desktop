/**
 * Transport-level outbound wire layer for the listener.
 *
 * Owns everything between "a protocol message is ready to leave" and the
 * socket: the bounded per-transport queue, backpressure policy, and wire perf
 * telemetry. Message-level concerns (envelope shape, event_seq semantics,
 * frame classification) stay in protocol-outbound.ts, which hands this module
 * pre-classified frames with a deferred `build()`.
 *
 * Design (borrowed from codex app-server, adapted to our topology — see
 * LET-10138): producers never interact with socket state; they enqueue into a
 * bounded queue drained by this module against `bufferedAmount` watermarks.
 * Snapshot ("status") frames coalesce latest-wins while queued. All other
 * frames are retained while the connection remains viable. If the bounded
 * queue fills or the socket stalls, the transport is terminated instead of
 * silently dropping stream deltas that the listener cannot replay. This
 * follows Codex's disconnect-slow-client policy.
 *
 * Frames are serialized (and take their event_seq) inside `build()` at drain
 * time, so frames superseded or skipped before build do not consume sequence
 * numbers.
 */
import { type ListenerTransport } from "./transport";
/**
 * How a frame behaves under backpressure.
 * - "critical": never dropped. If the queue reaches capacity, the transport
 *   is considered stalled and terminated.
 * - "status": snapshot semantics — a newer frame with the same coalesceKey
 *   fully supersedes a queued one (loop status, device status, queue state).
 *   A status frame without a newer replacement is still never dropped.
 */
export type OutboundFrameClass = "critical" | "status";
export interface OutboundFrame {
    /** Message type label for logs/telemetry (not parsed). */
    typeLabel: string;
    frameClass: OutboundFrameClass;
    /** Required for "status" frames: queued frame with the same key is replaced. */
    coalesceKey?: string;
    /**
     * Serialize the frame. Runs at drain time, immediately before the socket
     * write. Return null to skip the frame (e.g. sequence numbering became
     * unavailable). Must be side-effect free until the frame is actually sent;
     * post-send effects belong in `onSent`.
     */
    build(): {
        payload: string;
        perfKey: string;
        onSent?: () => void;
    } | null;
    /** Called if the socket write throws. */
    onSendError?(error: unknown): void;
}
/**
 * Queue and watermark limits.
 *
 * MAX_QUEUED_FRAMES follows Codex's bounded-channel approach (they use 128
 * per connection); we allow more headroom because one relay socket carries
 * every conversation and status frames coalesce away. HIGH_WATERMARK pauses
 * draining while the socket's own buffer is congested; KILL_THRESHOLD treats
 * the socket as stalled and terminates the paired connection.
 */
export declare const OUTBOUND_QUEUE_LIMITS: {
    readonly MAX_QUEUED_FRAMES: 512;
    readonly HIGH_WATERMARK_BUFFERED_BYTES: number;
    readonly KILL_THRESHOLD_BUFFERED_BYTES: number;
    readonly DRAIN_POLL_MS: 50;
};
/**
 * Enqueue a frame and drain as far as the socket allows. When the socket is
 * healthy this sends synchronously in the same tick (identical behavior to
 * the pre-queue direct send); the queue only forms under backpressure.
 */
export declare function enqueueOutboundFrame(transport: ListenerTransport, frame: OutboundFrame): void;
/** Test/diagnostic visibility into a transport's queue. */
export declare function getOutboundQueueStats(transport: ListenerTransport): {
    queuedFrames: number;
    killed: boolean;
};
export declare const __outboundWireTestUtils: {
    clearTransportQueue(transport: ListenerTransport): void;
};
//# sourceMappingURL=outbound-wire.d.ts.map