export declare const SUBAGENT_STDOUT_LOST_MARKER = "headless stdout stream failed before the final result was written";
export declare function isSubagentStdoutLostError(stderr: string): boolean;
/**
 * Write the stdout-lost marker to stderr synchronously. Callers exit the
 * process right after reporting, so an async `console.error` could be
 * truncated the same way the stdout stream was — `writeSync` to fd 2
 * guarantees the marker is flushed before `process.exit` runs.
 */
export declare function reportSubagentStdoutLoss(detail?: unknown): void;
//# sourceMappingURL=subagent-stdout-failure.d.ts.map