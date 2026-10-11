/** Per-file byte cap. The active file rotates once it reaches this size. */
export declare const MAX_BOUNDARY_LOG_BYTES: number;
/** Retained files, active file included: worst case 10 files x 10 MB. */
export declare const MAX_BOUNDARY_LOG_FILES = 10;
export interface BoundaryErrorEntry {
    errorType: string;
    message: string;
    context?: string;
    httpStatus?: number;
    modelId?: string;
    runId?: string;
    recentChunks?: Record<string, unknown>[];
    /** Tail of the debug log file, omitted for messages that may embed paths. */
    debugLogTail?: string;
    isSubagent?: boolean;
    subagentType?: string;
    modelHandle?: string;
    fallbackKind?: string;
    sessionId?: string;
    agentId?: string;
    agentOrigin?: string;
    surface?: string;
    platform?: string;
    version?: string;
}
export interface BoundaryErrorLogOptions {
    /** Override the log directory (tests). Defaults to `~/.haruyuki/logs`. */
    dir?: string;
    /** Override the per-file byte cap (tests). */
    maxBytes?: number;
    /** Override the retained file count, active file included (tests). */
    maxFiles?: number;
}
/** Absolute path of the file this module appends to. */
export declare function boundaryErrorLogPath(options?: BoundaryErrorLogOptions): string;
/**
 * Append one JSON line. Never throws, never blocks on the network.
 */
export declare function appendBoundaryError(entry: BoundaryErrorEntry, options?: BoundaryErrorLogOptions): void;
//# sourceMappingURL=boundary-error-log.d.ts.map