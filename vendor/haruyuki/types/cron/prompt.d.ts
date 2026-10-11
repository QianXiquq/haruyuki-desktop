import type { CronTask } from "./cron-file";
export { formatScheduledTaskPrompt, formatTimezoneQualifiedIso, parseScheduledTaskPrompt, type ScheduledTaskPromptInfo, type ScheduledTaskPromptInput, type ScheduledTaskRecurrence, } from "./scheduled-task-prompt";
export interface CronPromptTiming {
    /** The schedule occurrence that caused this turn to fire. */
    intendedOccurrence: Date;
    /** Authoritative time captured by the scheduler when the turn is enqueued. */
    schedulerNow: Date;
}
export declare function getIntendedCronOccurrence(task: Pick<CronTask, "recurring" | "scheduled_for">, matchedAt: Date): Date;
export declare function formatCronPrompt(task: CronTask, timing: CronPromptTiming): string;
//# sourceMappingURL=prompt.d.ts.map