/**
 * Utilities for writing tool output overflow to files.
 * When tool outputs exceed truncation limits, the full output is written to disk
 * and a pointer is provided in the truncated output.
 */
/**
 * Configuration options for tool output overflow behavior.
 * Can be controlled via environment variables.
 */
export declare const OVERFLOW_CONFIG: {
    /** Whether to write overflow to files (default: true) */
    readonly ENABLED: boolean;
    /** Whether to use middle-truncation instead of post-truncation (default: true) */
    readonly MIDDLE_TRUNCATE: boolean;
};
/**
 * Get the overflow directory for the current project.
 * Pattern: ~/.haruyuki/projects/<project-path>/agent-tools/
 *
 * @param workingDirectory - Current working directory (project root)
 * @returns Absolute path to the overflow directory
 */
export declare function getOverflowDirectory(workingDirectory: string): string;
/**
 * Ensure the overflow directory exists, creating it if necessary.
 *
 * @param workingDirectory - Current working directory (project root)
 * @returns Absolute path to the overflow directory
 */
export declare function ensureOverflowDirectory(workingDirectory: string): string;
/**
 * Write tool output to an overflow file.
 *
 * Secrets available to the current tool invocation are scrubbed before writing:
 * overflow captures tool output before the model-facing scrub in the tool manager
 * runs, so without this the file would persist raw secret values.
 *
 * @param content - Full content to write
 * @param workingDirectory - Current working directory (project root)
 * @param toolName - Name of the tool (optional, for filename)
 * @returns Absolute path to the written file
 */
export declare function writeOverflowFile(content: string, workingDirectory: string, toolName?: string, secrets?: Readonly<Record<string, string>>): string;
/**
 * Clean up old overflow files to prevent directory bloat.
 * Removes files older than the specified age.
 *
 * @param workingDirectory - Current working directory (project root)
 * @param maxAgeMs - Maximum age in milliseconds (default: 24 hours)
 * @returns Number of files deleted
 */
export declare function cleanupOldOverflowFiles(workingDirectory: string, maxAgeMs?: number): number;
/**
 * Get overflow file statistics for debugging/monitoring.
 *
 * @param workingDirectory - Current working directory (project root)
 * @returns Statistics object
 */
export declare function getOverflowStats(workingDirectory: string): {
    directory: string;
    exists: boolean;
    fileCount: number;
    totalSize: number;
};
//# sourceMappingURL=overflow.d.ts.map