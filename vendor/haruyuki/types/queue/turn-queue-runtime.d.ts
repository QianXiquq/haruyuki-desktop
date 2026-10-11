import type { MessageCreate } from "@letta-ai/letta-client/resources/agents/agents";
export type QueuedTurnInput<TUserContent> = {
    kind: "user";
    content: TUserContent;
} | {
    kind: "task_notification";
    text: string;
    content?: MessageCreate["content"];
} | {
    kind: "cron_prompt";
    text: string;
};
type MergeQueuedTurnInputOptions<TUserContent> = {
    normalizeUserContent: (content: TUserContent) => MessageCreate["content"];
    separatorText?: string;
};
export declare function buildTaskNotificationContent(item: {
    text: string;
    content?: MessageCreate["content"];
}): MessageCreate["content"];
export declare function mergeQueuedTurnInput<TUserContent>(queued: QueuedTurnInput<TUserContent>[], options: MergeQueuedTurnInputOptions<TUserContent>): MessageCreate["content"] | null;
export {};
//# sourceMappingURL=turn-queue-runtime.d.ts.map