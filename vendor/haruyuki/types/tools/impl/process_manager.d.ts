type TimerHandle = ReturnType<typeof setTimeout>;
export interface BackgroundProcessHandle {
    kill(signal?: string | number): unknown;
}
export interface BackgroundRuntimeScope {
    agentId: string;
    conversationId: string;
}
export interface BackgroundProcess {
    process: BackgroundProcessHandle;
    command: string;
    /**
     * Recent output lines that Bash replays in its completion notification.
     * Other background work keeps its output only in the output file.
     */
    stdout?: string[];
    stderr?: string[];
    status: "running" | "completed" | "failed";
    exitCode: number | null;
    startTime?: Date;
    outputFile?: string;
    totalStdoutLines?: number;
    totalStderrLines?: number;
    cleanupTimer?: TimerHandle;
    runtimeScope?: BackgroundRuntimeScope;
    /** Authenticated Cloud user responsible for launching this process. */
    kind?: "monitor" | "workflow";
    description?: string;
    monitorSource?: "command" | "websocket" | "github_pull_request";
    persistent?: boolean;
    secrets?: Readonly<Record<string, string>>;
    /**
     * Set when the agent deliberately stops the shell (TaskStop) so the
     * resulting "exit" event does not wake it with a failure notification for a
     * process it just killed on purpose.
     */
    completionNotificationSuppressed?: boolean;
}
export interface BackgroundTask {
    description: string;
    subagentType: string;
    displayType?: string;
    subagentId: string;
    status: "running" | "completed" | "failed";
    error?: string;
    startTime: Date;
    outputFile: string;
    abortController?: AbortController;
    /** Resolves once the local subagent launcher and its process tree have stopped. */
    completion?: Promise<void>;
    cleanupTimer?: TimerHandle;
    runtimeScope?: BackgroundRuntimeScope;
}
export declare const backgroundProcesses: Map<string, BackgroundProcess>;
export declare const backgroundTasks: Map<string, BackgroundTask>;
type BackgroundProcessStateListener = (scope?: BackgroundRuntimeScope) => void;
export declare function subscribeToBackgroundProcessState(listener: BackgroundProcessStateListener): () => void;
export declare function notifyBackgroundProcessStateChanged(scope?: BackgroundRuntimeScope): void;
export declare function getNextBashId(): string;
export declare function getNextMonitorId(): string;
export declare function getNextWorkflowId(): string;
export declare function getNextExecSessionId(): string;
export declare function getNextTaskId(): string;
export declare function getNextDownloadId(): string;
interface BackgroundRetentionConfig {
    completedEntryTtlMs: number;
    maxProcessLinesPerStream: number;
    maxProcessCharsPerStream: number;
    maxRunningProcesses: number;
    maxRunningTasks: number;
}
export declare function unrefTimer(timer: TimerHandle): void;
export declare function __setBackgroundRetentionConfigForTests(overrides: Partial<BackgroundRetentionConfig>): void;
export declare function __resetBackgroundRetentionConfigForTests(): void;
export declare function clearBackgroundProcessCleanup(id: string): void;
export declare function clearBackgroundTaskCleanup(id: string): void;
export declare function assertBackgroundProcessCapacity(): void;
export declare function assertBackgroundTaskCapacity(): void;
export declare function scheduleBackgroundProcessCleanup(id: string): void;
export declare function scheduleBackgroundTaskCleanup(id: string): void;
export declare function appendBackgroundProcessOutput(processState: BackgroundProcess, stream: "stdout" | "stderr", text: string): void;
/**
 * Get a temp directory for background task output files.
 * Uses HARUYUKI_SCRATCHPAD if set. Otherwise creates one private temp directory
 * for this process so fixed log filenames do not collide across users or runs.
 */
export declare function getBackgroundOutputDir(): string;
export declare function __resetBackgroundOutputDirForTests(): void;
/**
 * Create a unique output file path for a background process/task.
 */
export declare function createBackgroundOutputFile(id: string): string;
/**
 * Append content to a background output file.
 *
 * Returns `true` on success, `false` on failure such as ENOSPC. The function
 * never throws so that callers inside event callbacks (stdout/stderr data
 * handlers) do not propagate the exception and crash the host process.
 * Callers should check the return value and degrade the affected session or
 * background process instead of pretending the write succeeded.
 */
export declare function appendToOutputFile(filePath: string, content: string): boolean;
export declare function scrubCompletedBackgroundOutput(processState: BackgroundProcess): boolean;
export {};
//# sourceMappingURL=process_manager.d.ts.map