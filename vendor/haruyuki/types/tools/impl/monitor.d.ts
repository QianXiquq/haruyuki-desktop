import { resolveNotificationScope } from "../../utils/task-notifications.js";
import { type BackgroundProcess } from "./process_manager.js";
export declare const MONITOR_OUTPUT_FILE_BYTES: number;
interface MonitorWebSocketSource {
    url: string;
    protocols?: string[];
}
interface MonitorArgs {
    description: string;
    timeout_ms?: number;
    persistent?: boolean;
    command?: string;
    ws?: MonitorWebSocketSource;
    secretEnv?: Record<string, string>;
    parentScope?: {
        agentId: string;
        conversationId: string;
    };
    signal?: AbortSignal;
}
interface MonitorResult {
    content: Array<{
        type: "text";
        text: string;
    }>;
    taskId: string;
    timeoutMs: number;
    persistent: boolean;
}
export declare class MonitorOutputWriter {
    private readonly path;
    private bytesWritten;
    private truncated;
    private writeFailed;
    constructor(path: string);
    append(text: string): boolean;
}
export declare function queueMonitorEvent(params: {
    taskId: string;
    event: string;
    scope: ReturnType<typeof resolveNotificationScope>;
    secrets: Readonly<Record<string, string>>;
}): void;
export declare function markMonitorFinished(taskId: string, processState: BackgroundProcess, status: "completed" | "failed", exitCode: number | null): void;
export declare function monitor(args: MonitorArgs): Promise<MonitorResult>;
export declare function stopMonitorsForProcessExit(): void;
export declare function installMonitorProcessExitCleanup(): void;
export {};
//# sourceMappingURL=monitor.d.ts.map