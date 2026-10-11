/**
 * LSP Client - Handles JSON-RPC communication with LSP servers
 */
import { EventEmitter } from "node:events";
import type { InitializeResult, LSPServerProcess } from "./types.js";
export interface LSPClientOptions {
    serverID: string;
    server: LSPServerProcess;
    rootUri: string;
}
/**
 * LSP Client that communicates with an LSP server via JSON-RPC over STDIO
 */
export declare class LSPClient extends EventEmitter {
    private process;
    private rootUri;
    private stdin;
    private stdout;
    private requestId;
    private pendingRequests;
    private buffer;
    private initialized;
    constructor(options: LSPClientOptions);
    private setupListeners;
    private processBuffer;
    private handleMessage;
    private sendRequest;
    private sendNotification;
    private sendMessage;
    /**
     * Initialize the LSP server
     */
    initialize(): Promise<InitializeResult>;
    /**
     * Notify server that a document was opened
     */
    didOpen(uri: string, languageId: string, version: number, text: string): void;
    /**
     * Notify server that a document was changed
     */
    didChange(uri: string, version: number, text: string): void;
    /**
     * Notify server that a document was closed
     */
    didClose(uri: string): void;
    /**
     * Shutdown the LSP server gracefully
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=client.d.ts.map