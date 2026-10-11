export type ScheduledTaskRecurrence = {
    type: "one-off";
} | {
    type: "recurring";
    cron: string;
    fireNumber?: number;
};
/**
 * Conversation tag marking a conversation created by a scheduled task fire.
 *
 * Every schedule runner stamps this when it creates a conversation, so clients
 * can identify scheduled conversations without parsing the summary text.
 */
export declare const SCHEDULE_ORIGIN_TAG = "origin:schedule";
export interface ScheduledTaskPromptInput {
    name: string;
    description?: string | null;
    timezone: string;
    scheduledFor: Date;
    currentTime: Date;
    recurrence: ScheduledTaskRecurrence;
    prompt: string;
}
export interface ScheduledTaskPromptInfo {
    name: string;
    description: string | null;
    timezone: string | null;
    scheduledFor: string | null;
    recurrence: ScheduledTaskRecurrence;
    prompt: string;
}
export declare function formatTimezoneQualifiedIso(date: Date, timezone: string): string;
/**
 * Build the canonical prompt envelope for a scheduled agent turn.
 *
 * Every schedule runner should call this immediately before dispatch while
 * keeping its stored authored prompt separate from runtime metadata.
 */
export declare function formatScheduledTaskPrompt(input: ScheduledTaskPromptInput): string;
/** Parse canonical and legacy scheduled-task envelopes from persisted messages. */
export declare function parseScheduledTaskPrompt(rawText: string): ScheduledTaskPromptInfo | null;
//# sourceMappingURL=scheduled-task-prompt.d.ts.map