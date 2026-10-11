/**
 * Task Notification Formatting
 *
 * Formats background task completion notifications as XML.
 * The actual queueing is handled by messageQueueBridge.ts.
 */
export interface NotificationScope {
    agentId: string;
    conversationId: string;
}
export interface TaskNotification {
    taskId: string;
    status: "completed" | "failed";
    summary: string;
    result: string;
    outputFile?: string;
    usage?: {
        totalTokens?: number;
        toolUses?: number;
        durationMs?: number;
    };
}
/**
 * Capture the conversation and initiating sender when background work starts.
 *
 * Prefers the scope injected by executeTool, which is the only correct source
 * in listener/desktop mode where several agent scopes share one process, and
 * falls back to the process-global agent context for plain CLI sessions.
 * Returns undefined when neither is available, in which case the caller should
 * still queue the notification unscoped rather than drop it.
 * Keep this snapshot until delivery; a later turn may belong to another user.
 */
export declare function resolveNotificationScope(parentScope?: {
    agentId: string;
    conversationId: string;
}): NotificationScope | undefined;
/**
 * Format a single notification as XML string for queueing.
 */
export declare function formatTaskNotification(notification: TaskNotification): string;
export declare function formatMonitorEventNotification(notification: {
    taskId: string;
    event: string;
}): string;
export declare function extractTaskNotificationsForDisplay(message: string): {
    notifications: string[];
    cleanedText: string;
};
/**
 * Append task-notification events to a transcript buffer and flush.
 *
 * This is the pure-function core of App.tsx's `appendTaskNotificationEvents`
 * useCallback. Extracting it here makes the behavioral contract testable:
 * buffer writes MUST be followed by a flush so that notifications from
 * background subagent onComplete callbacks (which run outside React's render
 * cycle) appear immediately instead of waiting for the next unrelated render.
 */
export type NotificationBuffer = Pick<import("../cli/helpers/accumulator").Buffers, "byId" | "order">;
export declare function appendTaskNotificationEventsToBuffer(summaries: string[], buffer: NotificationBuffer, generateId: () => string, flush?: () => void): boolean;
//# sourceMappingURL=task-notifications.d.ts.map