import WebSocket from "ws";
/**
 * Outbound side of a listener connection.
 *
 * Remote environment listeners write protocol frames to a real WebSocket.
 * Local channel listeners have no remote peer, but still run the same turn
 * processor; their outbound protocol frames are intentionally discarded.
 */
export interface LocalTransport {
    readonly kind: "local";
    readonly bufferedAmount: number;
    isOpen(): boolean;
    send(data: string): void;
}
export interface RuntimeTransport {
    readonly kind: "runtime";
    readonly bufferedAmount: number;
    isOpen(): boolean;
    send(data: string): void;
}
export type ListenerTransport = WebSocket | LocalTransport | RuntimeTransport;
export declare class LocalListenerTransport implements LocalTransport {
    readonly kind: "local";
    readonly bufferedAmount = 0;
    isOpen(): boolean;
    send(_data: string): void;
}
export declare function isListenerTransportOpen(transport: ListenerTransport): boolean;
export declare function getListenerTransportKind(transport: ListenerTransport): "websocket" | "local" | "runtime";
//# sourceMappingURL=transport.d.ts.map