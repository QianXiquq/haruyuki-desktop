/**
 * Check if debug mode is enabled via HARUYUKI_DEBUG env var.
 * Also accepts DEBUG=1|true for legacy compatibility.
 */
export declare function isDebugEnabled(): boolean;
interface DebugLogFileOptions {
    /** Override the log root (tests). Defaults to ~/.haruyuki/logs/debug. */
    dir?: string;
    /** Override the per-file size cap in bytes (tests). */
    maxBytes?: number;
}
declare class DebugLogFile {
    private logPath;
    private agentDir;
    private dirCreated;
    private bytesWritten;
    private maxBytes;
    private truncationNoted;
    /**
     * Initialize for an agent + session. Call once at session start.
     * After this, every debugLog/debugWarn call is persisted to disk.
     * Respects HARUYUKI_CODE_TELEM=0 — skips file logging when telemetry is disabled.
     */
    init(agentId: string, sessionId: string, options?: DebugLogFileOptions): void;
    /** Append a single line to the log file (best-effort, sync). */
    appendLine(line: string): void;
    private writeRaw;
    /** Read the last N lines from the current log file. */
    getTail(maxLines?: number): string | undefined;
    private ensureDir;
    private pruneOldSessions;
}
/** Singleton — import and call init() once per session. */
export declare const debugLogFile: DebugLogFile;
/**
 * Log a debug message. Always written to the session log file.
 * Only printed to screen when HARUYUKI_DEBUG=1.
 */
export declare function debugLog(prefix: string, message: string, ...args: unknown[]): void;
/**
 * Log a debug warning. Always written to the session log file.
 * Only printed to screen when HARUYUKI_DEBUG=1.
 */
export declare function debugWarn(prefix: string, message: string, ...args: unknown[]): void;
export {};
//# sourceMappingURL=debug.d.ts.map