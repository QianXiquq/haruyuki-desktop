import type { DequeuedBatch, QueueItem } from "../../queue/queue-runtime";
import { type ListenerTransport } from "./transport";
import type { ConversationRuntime, IncomingMessage, StartListenerOptions } from "./types";
export declare function getQueueItemScope(item?: QueueItem | null): {
    agent_id?: string;
    conversation_id?: string;
};
export declare function getQueueItemsScope(items: QueueItem[]): {
    agent_id?: string;
    conversation_id?: string;
};
export declare function shouldQueueInboundMessage(parsed: IncomingMessage): boolean;
export declare function shouldProcessInboundMessageDirectly(runtime: ConversationRuntime, parsed: IncomingMessage): boolean;
export declare function consumeQueuedTurn(runtime: ConversationRuntime): {
    dequeuedBatch: DequeuedBatch;
    queuedTurn: IncomingMessage;
} | null;
export declare function scheduleQueuePump(runtime: ConversationRuntime, socket: ListenerTransport, opts: StartListenerOptions, processQueuedTurn: (queuedTurn: IncomingMessage, dequeuedBatch: DequeuedBatch) => Promise<void>): void;
//# sourceMappingURL=queue.d.ts.map