/**
 * Per-task cron run history backed by JSONL files next to crons.json.
 *
 * This mirrors the reference shape: job state stays in one JSON file, while
 * each job/task gets an append-only `runs/<id>.jsonl` history file.
 */
import { type CronRunOutcome, type CronRunReason, type CronTask } from "./cron-file";
export type CronRunLogStatus = "ok" | "error" | "skipped";
export interface CronRunLogEntry {
    ts: number;
    jobId: string;
    action: "finished";
    status?: CronRunLogStatus;
    outcome?: CronRunOutcome;
    reason?: CronRunReason;
    error?: string;
    summary?: string;
    agentId?: string;
    conversationId?: string;
    runId?: string;
    runAtMs?: number;
    queueItemId?: string;
    scheduledFor?: string | null;
    firedAt?: string;
    missedCount?: number;
    windowStart?: string;
    windowEnd?: string;
}
export interface CronRunLogPage {
    entries: CronRunLogEntry[];
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
    nextOffset: number | null;
}
export declare const DEFAULT_CRON_RUN_LOG_MAX_BYTES = 2000000;
export declare const DEFAULT_CRON_RUN_LOG_KEEP_LINES = 2000;
export declare function resolveCronRunLogPath(params: {
    storePath: string;
    jobId: string;
}): string;
export declare function getCronRunLogPath(jobId: string): string;
export declare function appendCronRunLog(filePath: string, entry: CronRunLogEntry, opts?: {
    maxBytes?: number;
    keepLines?: number;
}): void;
export declare function readCronRunLogEntries(filePath: string, opts?: {
    limit?: number;
    jobId?: string;
}): CronRunLogEntry[];
export declare function readCronRunLogEntriesPage(filePath: string, opts?: {
    limit?: number;
    offset?: number;
    jobId?: string;
    runId?: string;
}): CronRunLogPage;
export declare function appendCronRunLogForTask(task: CronTask, entry: Omit<CronRunLogEntry, "action" | "agentId" | "jobId" | "ts"> & {
    ts?: number;
}): void;
export declare function safeAppendCronRunLogForTask(task: CronTask, entry: Parameters<typeof appendCronRunLogForTask>[1]): void;
//# sourceMappingURL=run-log.d.ts.map