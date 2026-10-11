import { type ListenerTransport } from "./transport";
import type { ListenerConnectionId, ListenerConnectionState, ListenerMessageRouting, ListenerRuntime, StartListenerOptions } from "./types";
export declare const TO_SUBSCRIBERS: {
    readonly type: "ToSubscribers";
};
export declare const BROADCAST: {
    readonly type: "Broadcast";
};
export declare function toListenerConnection(connectionId: ListenerConnectionId): ListenerMessageRouting;
export declare function createConnectionRequestKey(connectionId: ListenerConnectionId, requestId: string): string;
export declare function openListenerConnection(params: {
    runtime: ListenerRuntime;
    connectionId: ListenerConnectionId;
    writer: ListenerTransport;
    cancellation?: AbortController;
    options: StartListenerOptions;
}): ListenerConnectionState;
export declare function markListenerConnectionInitialized(runtime: ListenerRuntime, connectionId: ListenerConnectionId): void;
export declare function subscribeListenerConnection(runtime: ListenerRuntime, connectionId: ListenerConnectionId, scope: {
    agent_id?: string | null;
    conversation_id?: string | null;
}): boolean;
export declare function unsubscribeListenerConnection(runtime: ListenerRuntime, connectionId: ListenerConnectionId, runtimeKey: string): boolean;
export declare function getSubscribedListenerConnections(runtime: ListenerRuntime, scope: {
    agent_id?: string | null;
    conversation_id?: string | null;
}): ListenerConnectionState[];
export declare function findListenerConnectionByTransport(runtime: ListenerRuntime, transport: ListenerTransport): ListenerConnectionState | null;
export interface ListenerConnectionTarget {
    connection: ListenerConnectionState | null;
    transport: ListenerTransport;
}
export declare function nextListenerConnectionEventSeq(connection: ListenerConnectionState | null, runtime: ListenerRuntime | null): number | null;
export declare function resolveListenerConnectionTargets(params: {
    runtime: ListenerRuntime | null;
    origin: ListenerTransport;
    scope: {
        agent_id?: string | null;
        conversation_id?: string | null;
    };
    routing: ListenerMessageRouting;
    streamMessage: boolean;
}): ListenerConnectionTarget[];
export declare function closeListenerConnection(runtime: ListenerRuntime, connectionId: ListenerConnectionId): ListenerConnectionState | null;
export declare function suspendListenerConnection(runtime: ListenerRuntime, connectionId: ListenerConnectionId): ListenerConnectionState | null;
export declare function getOrCreateProcessTransport(runtime: ListenerRuntime): ListenerTransport;
//# sourceMappingURL=connection.d.ts.map