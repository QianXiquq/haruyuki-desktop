export declare function extractUnifiedExecRunningSessionId(text: string): string | null;
/**
 * Codex unified exec returns model-facing metadata before the actual command
 * output. The TUI shell renderer should stay focused on what the command
 * printed, while preserving non-zero exits and running session status.
 */
export declare function formatUnifiedExecOutputForTui(text: string, options?: {
    hideEmptyCompletion?: boolean;
}): string;
//# sourceMappingURL=unified-exec-output.d.ts.map