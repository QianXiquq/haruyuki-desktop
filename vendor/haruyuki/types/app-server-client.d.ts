export type { AppServerInfoResponseMessage } from "./types/app-server-info";
export { isAppServerInfoResponseMessage } from "./types/app-server-info";
import type { AbortMessageCommand, AbortMessageResponseMessage, AppServerInfoResponseMessage, ConversationListCommand, ConversationListResponseMessage, ExternalToolCallRequestMessage, ExternalToolCallResult, InputAcceptedResponseMessage, InputCommand, LaunchSubagentCommand, LaunchSubagentResponse, MonitorStopCommand, MonitorStopResponse, ResumeQueueCommand, ResumeQueueResponseMessage, RuntimeExternalToolsUpdateCommand, RuntimeExternalToolsUpdateResponseMessage, RuntimeStartCommand, RuntimeStartResponseMessage, SyncCommand, SyncResponseMessage, WsProtocolCommand, WsProtocolMessage } from "./types/app-server-protocol";
export type AppServerChannel = "control" | "stream";
export type AppServerRawCommand = Record<string, unknown> & {
    type: string;
    request_id?: string;
};
export type AppServerRawResponse = Record<string, unknown> & {
    type: string;
    request_id?: string;
};
export type AppServerSendCommand = WsProtocolCommand | AppServerRawCommand;
/** Receives every parsed protocol frame from the app-server WebSocket. */
export type AppServerMessageHandler = (message: WsProtocolMessage, channel: AppServerChannel) => void;
/** Called synchronously before a typed or raw command is written to the socket. */
export type AppServerSendHandler = (command: AppServerSendCommand) => void;
export interface AppServerDisconnectEvent {
    channel: AppServerChannel;
    event: unknown;
}
/** Called once when the WebSocket closes before client.close(). */
export type AppServerDisconnectHandler = (disconnect: AppServerDisconnectEvent) => void;
export type AppServerExternalToolCallHandler = (request: ExternalToolCallRequestMessage) => Promise<ExternalToolCallResult> | ExternalToolCallResult;
export interface AppServerSocketLike {
    readyState: number;
    send(data: string): void;
    close(): void;
    addEventListener?(type: string, listener: (event: unknown) => void): void;
    removeEventListener?(type: string, listener: (event: unknown) => void): void;
    on?(type: string, listener: (event: unknown) => void): void;
    off?(type: string, listener: (event: unknown) => void): void;
    once?(type: string, listener: (event: unknown) => void): void;
}
export interface AppServerSocketOptions {
    headers?: Record<string, string>;
}
export type AppServerSocketConstructor = new (url: string, options?: AppServerSocketOptions) => AppServerSocketLike;
export interface AppServerClientOptions {
    /** Base app-server URL, e.g. ws://127.0.0.1:4500 or http://127.0.0.1:4500. */
    url: string;
    /** Optional capability token sent as Authorization: Bearer <token>; requires a WebSocket implementation with header support. */
    authToken?: string;
    /** Optional WebSocket constructor for Node/tests. Browsers use globalThis.WebSocket. */
    WebSocket?: AppServerSocketConstructor;
    /** Default timeout for request_id-correlated control requests. */
    requestTimeoutMs?: number;
}
export interface AppServerRequestOptions<TMessage extends WsProtocolMessage> {
    timeoutMs?: number;
    predicate?: (message: WsProtocolMessage) => message is TMessage;
}
export type AppServerRequestCommand = Extract<WsProtocolCommand, {
    request_id?: string;
}>;
export type AppServerRequestCommandWithId = AppServerRequestCommand & {
    request_id: string;
};
export type AppServerRequestBody = Record<string, unknown> & {
    request_id?: string;
};
export interface AppServerRawRequestOptions<TResponse extends AppServerRawResponse> {
    timeoutMs?: number;
    predicate: (message: unknown) => message is TResponse;
}
export declare function resolveAppServerUrl(url: string): string;
/**
 * @deprecated App-server uses one bidirectional WebSocket. Both historical
 * channel names resolve to that same socket URL.
 */
export declare function resolveAppServerChannelUrl(url: string, _channel: AppServerChannel): string;
export declare class AppServerClient {
    readonly socket: AppServerSocketLike;
    /** @deprecated Alias for socket. */
    readonly control: AppServerSocketLike;
    /** @deprecated Alias for socket; no second stream connection is created. */
    readonly stream: AppServerSocketLike;
    private readonly requestTimeoutMs;
    private readonly pending;
    private readonly messageHandlers;
    private readonly sendHandlers;
    private readonly disconnectHandlers;
    private explicitlyClosed;
    private disconnectNotified;
    private nextRequestNumber;
    constructor(options: AppServerClientOptions);
    connect(): Promise<this>;
    close(): void;
    onMessage(handler: AppServerMessageHandler): () => void;
    onSend(handler: AppServerSendHandler): () => void;
    onDisconnect(handler: AppServerDisconnectHandler): () => void;
    nextRequestId(prefix?: string): string;
    send(command: WsProtocolCommand): void;
    private writeCommand;
    /**
     * Send a forward-compatible protocol command from a compatibility adapter.
     * Prefer the typed wrappers above this boundary for normal product code.
     */
    sendRaw(command: AppServerRawCommand): void;
    /**
     * Request a forward-compatible response without mirroring the full protocol
     * union in a downstream compatibility adapter.
     */
    requestRaw<TResponse extends AppServerRawResponse>(command: AppServerRawCommand & {
        request_id: string;
    }, options: AppServerRawRequestOptions<TResponse>): Promise<TResponse>;
    request<TMessage extends WsProtocolMessage = WsProtocolMessage>(command: AppServerRequestCommandWithId, options?: AppServerRequestOptions<TMessage>): Promise<TMessage>;
    request<TType extends AppServerRequestCommand["type"], TMessage extends WsProtocolMessage = WsProtocolMessage>(type: TType, body?: AppServerRequestBody, options?: AppServerRequestOptions<TMessage>): Promise<TMessage>;
    info(options?: Omit<AppServerRequestOptions<AppServerInfoResponseMessage>, "predicate">): Promise<AppServerInfoResponseMessage>;
    stopMonitor(command: Omit<MonitorStopCommand, "type" | "request_id"> & {
        request_id?: string;
    }, options?: Omit<AppServerRequestOptions<MonitorStopResponse>, "predicate">): Promise<MonitorStopResponse>;
    launchSubagent(command: Omit<LaunchSubagentCommand, "type" | "request_id"> & {
        request_id?: string;
    }, options?: Omit<AppServerRequestOptions<LaunchSubagentResponse>, "predicate">): Promise<LaunchSubagentResponse>;
    runtimeStart(command: Omit<RuntimeStartCommand, "type" | "request_id"> & {
        request_id?: string;
    }, options?: Omit<AppServerRequestOptions<RuntimeStartResponseMessage>, "predicate">): Promise<RuntimeStartResponseMessage>;
    runtimeExternalToolsUpdate(command: Omit<RuntimeExternalToolsUpdateCommand, "type" | "request_id"> & {
        request_id?: string;
    }, options?: Omit<AppServerRequestOptions<RuntimeExternalToolsUpdateResponseMessage>, "predicate">): Promise<RuntimeExternalToolsUpdateResponseMessage>;
    sync(command: Omit<SyncCommand, "type" | "request_id"> & {
        request_id?: string;
    }, options?: Omit<AppServerRequestOptions<SyncResponseMessage>, "predicate">): Promise<SyncResponseMessage>;
    abort(command: Omit<AbortMessageCommand, "type" | "request_id"> & {
        request_id?: string;
    }, options?: Omit<AppServerRequestOptions<AbortMessageResponseMessage>, "predicate">): Promise<AbortMessageResponseMessage>;
    /** Release queue items parked by `abort()` without sending a new message. */
    resumeQueue(command: Omit<ResumeQueueCommand, "type" | "request_id"> & {
        request_id?: string;
    }, options?: Omit<AppServerRequestOptions<ResumeQueueResponseMessage>, "predicate">): Promise<ResumeQueueResponseMessage>;
    conversationList(command?: Omit<ConversationListCommand, "type" | "request_id"> & {
        request_id?: string;
    }, options?: Omit<AppServerRequestOptions<ConversationListResponseMessage>, "predicate">): Promise<ConversationListResponseMessage>;
    onExternalToolCall(handler: AppServerExternalToolCallHandler): () => void;
    /**
     * Submit input to a runtime. Observe progress, tool activity, approvals, and
     * terminal lifecycle events through onMessage().
     */
    input(command: Omit<InputCommand, "type">): void;
    /**
     * Submit an input and wait only until the listener accepts it into the
     * normal dispatch/queue path. This never waits for turn completion.
     */
    submitInput(command: Omit<InputCommand, "type" | "request_id"> & {
        request_id?: string;
    }, options?: Omit<AppServerRequestOptions<InputAcceptedResponseMessage>, "predicate">): Promise<InputAcceptedResponseMessage>;
    private handleMessage;
    private rejectAllPending;
    private handleDisconnect;
}
export declare function createAppServerClient(options: AppServerClientOptions): AppServerClient;
//# sourceMappingURL=app-server-client.d.ts.map