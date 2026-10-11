/**
 * In-process cron scheduler for the WS listener.
 *
 * On start:
 * 1. Claims the scheduler lease in crons.json
 * 2. Starts a setInterval that fires every 60s
 * 3. On each tick: reads active tasks, checks cron match against current time,
 *    enqueues matching tasks into their ConversationRuntime's queueRuntime,
 *    and kicks the queue pump
 * 4. Runs GC every 60 minutes
 *
 * On stop: clears interval, releases lease.
 */
import type { DequeuedBatch } from "../queue/queue-runtime";
import type { ListenerTransport } from "../websocket/listener/transport";
import type { IncomingMessage, StartListenerOptions } from "../websocket/listener/types";
import { type CronSchedulerScope, type CronTask } from "./cron-file";
import { type CronPromptTiming } from "./prompt";
export { type CronPromptTiming, formatCronPrompt, formatTimezoneQualifiedIso, getIntendedCronOccurrence, } from "./prompt";
type ProcessQueuedTurn = (queuedTurn: IncomingMessage, dequeuedBatch: DequeuedBatch) => Promise<void>;
export declare const CRON_SCHEDULER_SCOPE_ENV = "HARUYUKI_CRON_SCHEDULER_SCOPE";
export declare function resolveCronSchedulerScope(value?: string | undefined): CronSchedulerScope;
export declare function taskMatchesCronSchedulerScope(task: CronTask, scope: CronSchedulerScope): boolean;
export declare function minuteKey(date: Date): string;
export declare function wrapCronPrompt(task: CronTask, timing: CronPromptTiming): string;
export declare function shouldFireTask(task: CronTask, now: Date): boolean;
/**
 * Persist a visible failure for legacy recurring tasks that predate current
 * cron validation. Keep the task active so the user can inspect and replace
 * it instead of silently dropping it or garbage-collecting its definition.
 */
export declare function handleInvalidRecurringTask(task: CronTask, now: Date): boolean;
/** Returns true if the task was marked as missed (caller should skip firing). */
export declare function handleMissedOneShot(task: CronTask, now: Date): boolean;
/** Apply scheduler lifecycle checks shared by the WS and TUI tick loops. */
export declare function handleTaskPreflight(task: CronTask, now: Date): boolean;
export declare function runCronTaskNow(taskId: string): Promise<{
    success: boolean;
    found: boolean;
    task?: CronTask;
    error?: string;
}>;
/**
 * Start the cron scheduler. Should be called when the WS listener connects.
 * No-ops if already running.
 *
 * If the lease claim fails (e.g. another process briefly holds it after a
 * crash/restart), the scheduler will retry up to MAX_LEASE_RETRIES times
 * with LEASE_RETRY_MS between attempts. The user is warned that cron
 * tasks won't fire until the scheduler starts.
 */
export declare function startScheduler(socket: ListenerTransport, opts: StartListenerOptions, processQueuedTurn: ProcessQueuedTurn, _retryCount?: number): void;
/**
 * Stop the cron scheduler. Should be called when the WS listener disconnects.
 */
export declare function stopScheduler(): void;
/**
 * Check if the scheduler is running.
 */
export declare function isSchedulerRunning(): boolean;
//# sourceMappingURL=scheduler.d.ts.map