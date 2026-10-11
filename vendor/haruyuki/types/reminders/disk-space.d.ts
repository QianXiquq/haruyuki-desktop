/** Warn when at least this fraction of the volume is used... */
export declare const LOW_DISK_USED_FRACTION = 0.9;
/** ...or when less than this many bytes remain available. */
export declare const LOW_DISK_AVAILABLE_BYTES: number;
/** Minimum time between disk measurements. */
export declare const DISK_SPACE_CHECK_INTERVAL_MS = 60000;
export interface DiskSpaceSample {
    path: string;
    totalBytes: number;
    availableBytes: number;
}
type StatfsFn = (path: string) => Promise<{
    bsize: number;
    blocks: number;
    bavail: number;
}>;
export declare function isDiskSpaceLow(sample: DiskSpaceSample): boolean;
/**
 * Start a background measurement if the last one is old enough. Never awaits
 * and never throws: a failed measurement leaves the previous sample in place.
 */
export declare function refreshDiskSpaceSample(path: string, options?: {
    nowMs?: number;
    statfsFn?: StatfsFn;
}): void;
export declare function getCachedDiskSpaceSample(): DiskSpaceSample | null;
export declare function resetDiskSpaceCacheForTests(): void;
export declare function formatLowDiskSpaceReminder(sample: DiskSpaceSample): string;
/** Escalate a second time once the volume is this full. */
export declare const CRITICAL_DISK_USED_FRACTION = 0.95;
/** How often to re-check the disk while a tool batch is running. */
export declare const DISK_SPACE_POLL_INTERVAL_MS = 30000;
/**
 * Measure now and return a reminder only when the level rises (low, then
 * critical). Used on a timer while tools run, so a long install or a running
 * subagent can't fill the disk between turns unnoticed.
 */
export declare function checkDiskSpaceNow(path: string, options?: {
    env?: NodeJS.ProcessEnv;
    statfsFn?: StatfsFn;
}): Promise<string | null>;
/**
 * Poll the disk while `work` runs and hand any new alert to `deliver`
 * (a queued task notification), so it reaches the agent without waiting
 * for the next user turn.
 */
export declare function watchDiskSpaceDuring<T>(path: string, deliver: (reminder: string) => void, work: () => Promise<T>, options?: {
    env?: NodeJS.ProcessEnv;
    statfsFn?: StatfsFn;
    intervalMs?: number;
}): Promise<T>;
/**
 * Queue the alert like a task notification so an idle agent wakes for it.
 * Subagents have no queue, so it rides their next model request instead.
 */
export declare function deliverDiskSpaceReminder(text: string, parentScope?: {
    agentId: string;
    conversationId: string;
}): void;
/** Take (and clear) an alert held for the next model request. */
export declare function takePendingDiskSpaceReminder(): string | null;
export declare function resetDiskSpaceAlertForTests(): void;
export interface DiskSpaceReminderInput {
    workingDirectory: string;
    /** Per-conversation flag: true once the current low-disk episode was reported. */
    notified: boolean;
    env?: NodeJS.ProcessEnv;
    nowMs?: number;
    statfsFn?: StatfsFn;
}
/**
 * Fire-and-forget low-disk check for managed Cloud sandboxes. The turn never
 * waits on the filesystem: it reads the last cached sample and schedules a
 * fresh one for a later turn. Reports once per low-disk episode.
 */
export declare function evaluateDiskSpaceReminder(input: DiskSpaceReminderInput): {
    text: string | null;
    notified: boolean;
};
export {};
//# sourceMappingURL=disk-space.d.ts.map