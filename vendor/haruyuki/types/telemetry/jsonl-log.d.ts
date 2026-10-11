/**
 * Append-only JSONL log file with size-bounded rotation.
 *
 * Shared by the two local diagnostics sinks — boundary errors and user feedback
 * — so both bound their disk usage the same way: the active file rotates into a
 * numbered archive once it passes `maxBytes`, and the oldest archive beyond
 * `maxFiles` is deleted. Without the cap, a long-running session that keeps
 * hitting one event would grow a single file until the disk fills.
 *
 * Every write is best-effort by design: callers sit on error or user-facing
 * paths that must not throw, and a diagnostic must never mask the failure it
 * reports.
 */
export interface JsonlLogOptions {
    /** Override the log directory (tests). Defaults to the configured one. */
    dir?: string;
    /** Override the per-file byte cap (tests). */
    maxBytes?: number;
    /** Override the retained file count, active file included (tests). */
    maxFiles?: number;
}
export interface JsonlLogConfig {
    /** Active file name without the `.jsonl` suffix. */
    basename: string;
    /** Directory used when a call site does not override it. */
    defaultDir: string;
    maxBytes: number;
    maxFiles: number;
}
export interface JsonlLog {
    /** Absolute path of the file appended to for the given options. */
    path(options?: JsonlLogOptions): string;
    /** Append one line. Never throws, never blocks on the network. */
    append(entry: unknown, options?: JsonlLogOptions): void;
}
export declare function createJsonlLog(config: JsonlLogConfig): JsonlLog;
//# sourceMappingURL=jsonl-log.d.ts.map