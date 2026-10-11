import type { MessageCreate } from "@letta-ai/letta-client/resources/agents/agents";
/**
 * Message Queue Bridge
 *
 * Allows non-React code (like Task.ts) to add messages to the messageQueue.
 * The queue adder function is set by the active consumer on mount.
 *
 * This enables background tasks to queue their notification XML directly
 * into messageQueue, where the existing dequeue logic handles auto-firing.
 */
export type QueuedMessage = {
    kind: "user" | "task_notification";
    text: string;
    /** Original multimodal result parts for a task notification, after its text header. */
    content?: MessageCreate["content"];
    /** Preserve scheduled origin even when its prompt is rendered as user text. */
    source?: "cron";
    /** Optional parent agent scope for routing in listener mode. */
    agentId?: string;
    /** Optional parent conversation scope for routing in listener mode. */
    conversationId?: string;
    /** Authenticated human responsible for a notification-triggered turn. */
    /** QueueRuntime-assigned ID for targeted remove/edit operations. */
    queueItemId?: string;
    /** Parked by Esc; waits for Enter on an empty input or the next message. */
    paused?: boolean;
};
type QueueAdder = (message: QueuedMessage) => void;
/**
 * Set the queue adder function. Called by App.tsx on mount.
 */
export declare function setMessageQueueAdder(fn: QueueAdder | null): void;
/**
 * Add a message to the messageQueue.
 * Called from Task.ts when a background task completes.
 * If queue adder not set (App not mounted), message is dropped.
 */
export declare function addToMessageQueue(message: QueuedMessage): void;
/**
 * Check if the queue bridge is connected.
 */
export declare function isQueueBridgeConnected(): boolean;
/**
 * Clear any pending messages (for testing).
 */
export declare function clearPendingMessages(): void;
export {};
//# sourceMappingURL=message-queue-bridge.d.ts.map