/**
 * Persistent cron task storage backed by ~/.haruyuki/crons.json.
 *
 * Provides CRUD operations with:
 * - Atomic writes (temp file + rename)
 * - mkdir-based advisory locking for read-modify-write cycles
 * - Scheduler ownership lease (PID + random token)
 * - Garbage collection for terminal tasks older than 24 hours
 */
export { __testOverrideReadProcessIdentity, isProcessAlive, } from "./process-identity";
export type CronTaskStatus = "active" | "paused" | "fired" | "missed" | "cancelled";
export type CancelReason = "conversation_not_found" | "expired";
export type CronRunOutcome = "queued" | "missed" | "failed" | "skipped";
export type CronRunReason = "scheduled_time_matched" | "one_off_due" | "scheduler_inactive" | "started_too_late" | "queue_full" | "runtime_unavailable" | "task_cancelled" | "invalid_cron" | "scheduler_error";
export interface SchedulerOwner {
    pid: number;
    token: string;
    started_at: string;
    process_start_ticks?: string | null;
    boot_id?: string | null;
}
export type CronSchedulerScope = "all" | "cloud" | "local";
export interface CronTask {
    id: string;
    agent_id: string;
    /**
     * Conversation target for scheduled fires.
     * - "default" (default): enqueue into the agent's default conversation
     * - "new": create a fresh conversation for every fire
     * - any other string: enqueue into that existing conversation id
     */
    conversation_id: string;
    name: string;
    description: string;
    cron: string;
    timezone: string;
    recurring: boolean;
    prompt: string;
    status: CronTaskStatus;
    created_at: string;
    expires_at: string | null;
    last_fired_at: string | null;
    fire_count: number;
    cancel_reason: CancelReason | null;
    jitter_offset_ms: number;
    last_run_at: string | null;
    last_run_outcome: CronRunOutcome | null;
    last_run_reason: CronRunReason | null;
    last_run_error: string | null;
    last_missed_at: string | null;
    missed_count: number;
    failed_count: number;
    scheduled_for: string | null;
    fired_at: string | null;
    missed_at: string | null;
}
interface CronFileData {
    version: 1;
    scheduler_owner: SchedulerOwner | null;
    scheduler_owners: Partial<Record<Exclude<CronSchedulerScope, "all">, SchedulerOwner>>;
    tasks: CronTask[];
}
export declare function getCronFilePath(): string;
export declare function readCronFile(): CronFileData;
export interface LockHandle {
    release(): void;
}
/**
 * Acquire the crons.lock advisory lock.
 * Throws if unable to acquire within LOCK_TIMEOUT_MS.
 */
export declare function acquireLock(): LockHandle;
/**
 * Execute a callback while holding the lock.
 * Lock is released in a finally block.
 */
export declare function withLock<T>(fn: () => T): T;
/**
 * Compute jitter offset for a task.
 * - Recurring: late jitter, bounded by min(10% of period, 15 min)
 * - One-shot at :00/:30: early jitter up to 90s (negative offset)
 * - Other one-shots: no jitter (0)
 */
export declare function computeJitter(taskId: string, cron: string, recurring: boolean, scheduledFor: Date | null, createdAt: Date): number;
export interface AddTaskInput {
    agent_id: string;
    /**
     * Conversation target for scheduled fires.
     * - omitted/"new": fresh conversation per fire
     * - "default": agent default conversation
     * - any other string: existing conversation id
     */
    conversation_id?: string;
    name: string;
    description: string;
    cron: string;
    timezone?: string;
    recurring: boolean;
    prompt: string;
    scheduled_for?: Date;
}
export interface AddTaskResult {
    task: CronTask;
    warning?: string;
}
/**
 * Add a new cron task. Acquires the lock internally.
 */
export declare function addTask(input: AddTaskInput): AddTaskResult;
/**
 * List tasks, optionally filtered by agent and/or conversation.
 */
export declare function listTasks(filters?: {
    agent_id?: string;
    conversation_id?: string;
}): CronTask[];
/**
 * Get a single task by ID.
 */
export declare function getTask(taskId: string): CronTask | null;
/**
 * Delete a task by ID. Physical removal from the file.
 * Acquires the lock internally.
 * Returns true if found and removed, false if not found.
 */
export declare function deleteTask(taskId: string): boolean;
/**
 * Delete all tasks for a given agent. Physical removal.
 * Acquires the lock internally.
 * Returns the number of tasks removed.
 */
export declare function deleteAllTasks(agentId: string): number;
/**
 * True when a live lease would process schedules for `backend`.
 * A true all-agent owner (live `scheduler_owner`, no live scoped owners)
 * covers every backend. A scoped owner only covers its own lane. A
 * mixed-version tombstone in `scheduler_owner` does not count as all-owner
 * while a scoped row is live.
 */
export declare function hasLiveSchedulerOwner(data: {
    scheduler_owner: SchedulerOwner | null;
    scheduler_owners?: Partial<Record<Exclude<CronSchedulerScope, "all">, SchedulerOwner>>;
}, backend: Exclude<CronSchedulerScope, "all">): boolean;
/**
 * Claim the scheduler lease. Returns the token on success.
 * Throws if another live process holds the lease.
 *
 * Scoped claims also write a live `scheduler_owner` tombstone so older
 * binaries that only inspect that field refuse `claimSchedulerLease()` and
 * cannot rewrite the file without `scheduler_owners`.
 */
export declare function claimSchedulerLease(scope?: CronSchedulerScope): string;
/**
 * Verify we still hold the scheduler lease.
 */
export declare function verifySchedulerLease(token: string, scope?: CronSchedulerScope): boolean;
export declare function __testFailNextRefreshSchedulerLease(fail?: boolean): void;
export declare function __testThrowNextRefreshSchedulerLease(shouldThrow?: boolean): void;
/**
 * Confirm we still hold the lease. Scoped holders restore a dead tombstone
 * and a missing row when we own it or it matches `knownTombstoneToken`.
 * A different live all-owner is lease loss. Heartbeat, not only the 60s tick.
 */
export declare function refreshSchedulerLease(token: string, scope?: CronSchedulerScope, knownTombstoneToken?: string): boolean;
/**
 * Release the scheduler lease.
 */
export declare function releaseSchedulerLease(token: string, scope?: CronSchedulerScope): void;
/**
 * Update task state atomically. Acquires the lock.
 * Callback receives the task and can mutate it in-place.
 * Returns the updated task, or null if not found.
 */
export declare function updateTask(taskId: string, updater: (task: CronTask) => void): CronTask | null;
export declare function recordTaskQueued(taskId: string, trigger: "automatic" | "manual", queuedAt: Date): CronTask | null;
export interface CronStateChangeResult {
    success: boolean;
    found: boolean;
    task?: CronTask;
    error?: string;
}
/** Pause an active task atomically. Repeated pauses are successful no-ops. */
export declare function pauseTask(taskId: string): CronStateChangeResult;
/**
 * Resume a paused task atomically. An overdue one-off requires a replacement
 * future timestamp in the same operation. Repeated resumes are no-ops.
 */
export declare function resumeTask(taskId: string, scheduledFor?: Date, now?: Date): CronStateChangeResult;
/**
 * Remove terminal tasks (fired, missed, cancelled) older than 24 hours.
 * Acquires the lock. Returns the number of tasks removed.
 */
export declare function garbageCollect(): number;
/**
 * Read the cron file and return only active tasks.
 * Does NOT acquire the lock (read-only operation).
 */
export declare function getActiveTasks(): CronTask[];
/**
 * Get the mtime of crons.json for change detection.
 * Returns 0 if the file doesn't exist.
 */
export declare function getCronFileMtime(): number;
//# sourceMappingURL=cron-file.d.ts.map