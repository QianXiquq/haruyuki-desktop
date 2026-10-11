import type { ListenerRuntime, ObservedProtocolV2Message } from "./types";
/**
 * Notify in-process observers (e.g. the OpenAI-compat HTTP bridge) of an
 * outbound v2 protocol message. Observers consume protocol messages without
 * owning a transport, so callers must notify before any socket-open gate: a
 * closed or absent socket must not starve them.
 */
export declare function notifyStreamObservers(listener: ListenerRuntime | null, message: Record<string, unknown>, runtimeScope: ObservedProtocolV2Message["runtime"]): void;
/**
 * Deliver a synthetic terminal event when a runtime is stopped (e.g. a WS
 * control client replacing a bridge-owned runtime). Without this, in-flight
 * observers would wait on turns that will never emit again. The observer set
 * is cleared afterwards: the runtime is dead.
 */
export declare function notifyStreamObserversRuntimeStopped(listener: ListenerRuntime): void;
//# sourceMappingURL=stream-observers.d.ts.map