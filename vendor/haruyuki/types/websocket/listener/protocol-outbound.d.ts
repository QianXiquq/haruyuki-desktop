import type { DequeuedBatch } from "../../queue/queue-runtime";
import type { DeviceStatus, LoopState, QueueMessage, RuntimeScope, StatusMessage, StopReasonType, StreamDelta, SubagentSnapshot, WsProtocolMessage } from "../../types/protocol_v2";
import type { QueueRemovalTransition } from "../../types/queue-update-protocol";
import { type ListenerTransport } from "./transport";
import type { ConversationRuntime, IncomingMessage, ListenerMessageRouting, ListenerRuntime } from "./types";
type RuntimeCarrier = ListenerRuntime | ConversationRuntime | null;
type PartialRuntimeScope = {
    agent_id?: string | null;
    conversation_id?: string | null;
};
export declare function refreshDeviceGitContext(runtime: RuntimeCarrier, params?: PartialRuntimeScope): Promise<void>;
export declare function emitRuntimeStateUpdates(runtime: RuntimeCarrier, scope: PartialRuntimeScope | undefined): void;
export declare function buildDeviceStatus(runtime: RuntimeCarrier, params?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}): DeviceStatus;
export declare function buildLoopStatus(runtime: RuntimeCarrier, params?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}): LoopState;
export declare function buildQueueSnapshot(runtime: RuntimeCarrier, params?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}): QueueMessage[];
type OutboundProtocolMessage = WsProtocolMessage extends infer TMessage ? TMessage extends WsProtocolMessage ? Omit<TMessage, "runtime" | "event_seq" | "emitted_at" | "idempotency_key"> : never : never;
export declare function emitProtocolV2Message(socket: ListenerTransport, runtime: RuntimeCarrier, message: OutboundProtocolMessage, scope: {
    agent_id?: string | null;
    conversation_id?: string | null;
} | undefined, routing: ListenerMessageRouting): void;
export declare function broadcastServiceProtocolMessage(runtime: ListenerRuntime, message: WsProtocolMessage): void;
export declare function emitDeviceStatusUpdate(socket: ListenerTransport, runtime: RuntimeCarrier, scope?: PartialRuntimeScope, routing?: ListenerMessageRouting): void;
export declare function emitLoopStatusUpdate(socket: ListenerTransport, runtime: RuntimeCarrier, scope?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}, routing?: ListenerMessageRouting): void;
export declare function emitLoopStatusIfOpen(runtime: RuntimeCarrier, scope?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}): void;
export declare function emitDeviceStatusIfOpen(runtime: RuntimeCarrier, scope?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}): void;
export declare function emitQueueUpdate(socket: ListenerTransport, runtime: RuntimeCarrier, scope?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}, routing?: ListenerMessageRouting, removed?: readonly QueueRemovalTransition[]): void;
export declare function isSystemReminderPart(part: unknown): boolean;
export declare function emitDequeuedUserMessage(socket: ListenerTransport, runtime: RuntimeCarrier, incoming: IncomingMessage, batch: DequeuedBatch): void;
export declare function emitQueueUpdateIfOpen(runtime: RuntimeCarrier, scope?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}, removed?: readonly QueueRemovalTransition[]): void;
export declare function emitDeviceStatusUpdateIfChanged(socket: ListenerTransport, runtime: RuntimeCarrier, scope?: PartialRuntimeScope, options?: {
    force?: boolean;
}, routing?: ListenerMessageRouting): boolean;
export declare function emitStateSync(socket: ListenerTransport, runtime: RuntimeCarrier, scope: RuntimeScope<string | null>, options?: {
    forceDeviceStatus?: boolean;
    routing?: ListenerMessageRouting;
}): void;
export declare function buildSubagentSnapshot(runtime: RuntimeCarrier, scope?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}): SubagentSnapshot[];
export declare function emitSubagentStateUpdate(socket: ListenerTransport, runtime: RuntimeCarrier, scope?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}, routing?: ListenerMessageRouting): void;
export declare function emitSubagentStateIfOpen(runtime: RuntimeCarrier, scope?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}): void;
export declare function createLifecycleMessageBase<TMessageType extends string>(messageType: TMessageType, runId?: string | null): {
    id: string;
    date: string;
    message_type: TMessageType;
    run_id?: string;
};
export declare function emitCanonicalMessageDelta(socket: ListenerTransport, runtime: RuntimeCarrier, delta: StreamDelta, scope?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}): void;
export declare function emitRetryDelta(socket: ListenerTransport, runtime: RuntimeCarrier, params: {
    message: string;
    reason: StopReasonType;
    attempt: number;
    maxAttempts: number;
    delayMs: number;
    runId?: string | null;
    agentId?: string | null;
    conversationId?: string | null;
}): void;
export declare function emitStatusDelta(socket: ListenerTransport, runtime: RuntimeCarrier, params: {
    message: string;
    level: StatusMessage["level"];
    runId?: string | null;
    agentId?: string | null;
    conversationId?: string | null;
}): void;
export declare function emitInterruptedStatusDelta(socket: ListenerTransport, runtime: RuntimeCarrier, params: {
    runId?: string | null;
    agentId?: string | null;
    conversationId?: string | null;
}): void;
export declare function emitStreamDelta(socket: ListenerTransport, runtime: RuntimeCarrier, delta: StreamDelta, scope?: {
    agent_id?: string | null;
    conversation_id?: string | null;
}, subagentId?: string): void;
export {};
//# sourceMappingURL=protocol-outbound.d.ts.map