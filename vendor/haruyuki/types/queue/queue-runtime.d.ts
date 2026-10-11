import type { MessageCreate } from "@letta-ai/letta-client/resources/agents/agents";
import type { QueueBlockedReason, QueueClearedReason, QueueItemDroppedReason, QueueItemKind, QueueItemSource } from "../types/protocol";
export type { QueueBlockedReason, QueueClearedReason, QueueItemKind };
type QueueItemBase = {
    /** Stable monotonic ID assigned on enqueue. */
    id: string;
    /** Optional client-side message correlation ID from submit payloads. */
    clientMessageId?: string;
    /** Optional agent scope for listener-mode attribution. */
    agentId?: string;
    /** Optional conversation scope for listener-mode attribution. */
    conversationId?: string;
    source: QueueItemSource;
    enqueuedAt: number;
    /**
     * Parked by a user interrupt. Paused items stay visible in the queue but
     * are skipped by every dequeue path until `resume()` clears the flag.
     * Only user-authored messages are ever paused; system-originated items
     * (task notifications, cron prompts, mod continuations) keep flowing.
     */
    paused?: boolean;
};
export type MessageQueueItem = QueueItemBase & {
    kind: "message";
    /** Full multimodal content — string or content-part array. */
    content: MessageCreate["content"];
    /**
     * Never merge this item with other queued messages. Set by request-scoped
     * producers (e.g. the OpenAI-compat HTTP bridge) where each message must
     * run as its own turn so its correlated client request can settle.
     */
    noCoalesce?: boolean;
};
export type TaskNotificationQueueItem = QueueItemBase & {
    kind: "task_notification";
    /** XML notification string. */
    text: string;
    /** Original tool content, including image parts, delivered after the XML header. */
    content?: MessageCreate["content"];
};
export type ApprovalResultQueueItem = QueueItemBase & {
    kind: "approval_result";
    text: string;
};
export type OverlayActionQueueItem = QueueItemBase & {
    kind: "overlay_action";
    text: string;
};
export type CronPromptQueueItem = QueueItemBase & {
    kind: "cron_prompt";
    /** XML-wrapped prompt text. */
    text: string;
    /** Cron task ID for tracing. */
    cronTaskId: string;
};
export type ModContinueQueueItem = QueueItemBase & {
    kind: "mod_continue";
    /** Follow-up text from a mod's turn_end { continue }, sent as a user message. */
    text: string;
};
export type QueueItem = MessageQueueItem | TaskNotificationQueueItem | CronPromptQueueItem | ApprovalResultQueueItem | OverlayActionQueueItem | ModContinueQueueItem;
/** Coalescable items can be merged into a single submission batch. */
export declare function isCoalescable(kind: QueueItemKind): boolean;
export interface DequeuedBatch {
    batchId: string;
    items: QueueItem[];
    /**
     * Number of items that were merged into this batch.
     * Equal to items.length for coalescable batches; 1 for barrier items.
     */
    mergedCount: number;
    /** Queue length after this batch was removed. */
    queueLenAfter: number;
}
export interface QueueCallbacks {
    onEnqueued?: (item: QueueItem, queueLen: number) => void;
    onDequeued?: (batch: DequeuedBatch) => void;
    /**
     * Fired on blocked-reason state transitions (not on every check).
     * Only fires when queue is non-empty.
     */
    onBlocked?: (reason: QueueBlockedReason, queueLen: number) => void;
    onCleared?: (reason: QueueClearedReason, clearedCount: number, items: QueueItem[]) => void;
    /**
     * Fired when an item is dropped.
     * queueLen is the post-operation queue depth:
     * - Soft-limit coalescable drop: one removed, one added → net unchanged.
     * - Hard-ceiling rejection: item not added → current length unchanged.
     */
    onDropped?: (item: QueueItem, reason: QueueItemDroppedReason, queueLen: number) => void;
    /**
     * Fired when an item is explicitly removed via removeItem().
     * queueLen is the post-removal queue depth.
     */
    onRemoved?: (item: QueueItem, queueLen: number) => void;
    /**
     * Fired when pause()/resume() changes which items are parked.
     * pausedCount is the number of items still paused afterwards.
     */
    onPauseChanged?: (pausedCount: number, queueLen: number) => void;
}
export interface QueueRuntimeOptions {
    /**
     * Soft limit. When reached, the oldest coalescable item is dropped
     * to make room for a new one. Default: 100.
     */
    maxItems?: number;
    /**
     * Hard ceiling. When reached, enqueue is rejected entirely (returns null)
     * for all item kinds and onDropped fires. Default: maxItems * 3.
     */
    hardMaxItems?: number;
    callbacks?: QueueCallbacks;
}
export declare class QueueRuntime {
    private readonly store;
    private readonly callbacks;
    private readonly maxItems;
    private readonly hardMaxItems;
    private nextId;
    private nextBatchId;
    private lastEmittedBlockedReason;
    private blockedEmittedForNonEmpty;
    constructor(options?: QueueRuntimeOptions);
    /**
     * Add an item to the queue. Returns the enqueued item (with assigned id
     * and enqueuedAt), or null if the hard ceiling was reached.
     *
     * - If at soft limit and item is coalescable: drops oldest coalescable item.
     * - If at soft limit and item is a barrier: allows overflow (soft limit only
     *   applies to coalescable items).
     * - If at hard ceiling: rejects all item kinds, fires onDropped("buffer_limit").
     */
    enqueue(input: Omit<QueueItem, "id" | "enqueuedAt">): QueueItem | null;
    /**
     * Attempt to dequeue the next batch.
     *
     * Pass `blockedReason` (non-null) when the caller's gating conditions
     * prevent submission. Pass `null` when submission is allowed.
     *
     * Returns null if blocked or queue is empty.
     * Returns a DequeuedBatch with coalescable items (or a single barrier).
     */
    tryDequeue(blockedReason: QueueBlockedReason | null): DequeuedBatch | null;
    /**
     * Caller-controlled dequeue: removes exactly the first `n` items (or all
     * available if fewer exist) without applying the coalescable/barrier policy.
     * Used when the caller has already decided how many items to consume (e.g.
     * headless coalescing loop, listen one-message-per-turn).
     * Returns null if queue is empty or n <= 0.
     */
    consumeItems(n: number): DequeuedBatch | null;
    /**
     * Reset blocked-reason tracking after a turn completes (unblocked transition).
     * Call when the consumer becomes idle so the next arrival can re-emit
     * onBlocked correctly. Should only be called when the queue is actually
     * idle (i.e. pendingTurns === 0 in listen, turnInProgress === false in headless).
     */
    resetBlockedState(): void;
    /**
     * Remove a specific item by ID. Returns the removed item, or null
     * if no item with that ID exists. Fires onRemoved callback.
     */
    removeItem(id: string): QueueItem | null;
    /**
     * Park every queued user message. Called when the user interrupts: the
     * interrupted turn stops, and the messages the user queued behind it wait
     * for an explicit resume or for the user's next message instead of
     * starting the next turn on their own. System-originated items are not
     * affected. Returns the number of items newly paused.
     */
    pause(): number;
    /** Release every paused item. Returns the number of items resumed. */
    resume(): number;
    /** Remove all items and fire onCleared. */
    clear(reason: QueueClearedReason): void;
    get length(): number;
    get isEmpty(): boolean;
    /** Items a dequeue may take right now (everything that is not paused). */
    get readyLength(): number;
    get pausedCount(): number;
    get items(): readonly QueueItem[];
    peek(): readonly QueueItem[];
    /** Like peek(), without paused items. Dequeue planners must use this. */
    peekReady(): readonly QueueItem[];
    /** Remove the given items (by identity) from the store, preserving order. */
    private removeAll;
    private makeItem;
    private safeCallback;
}
//# sourceMappingURL=queue-runtime.d.ts.map