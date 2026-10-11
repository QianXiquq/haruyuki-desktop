/**
 * In-process registry of Workflow tool runs, kept for status reporting.
 *
 * The Workflow tool launches a run in the background and returns at once; the
 * run then reports progress here. The /workflows command, the status rows
 * under the input, and the completion summary read from it; the TUI
 * subscribes to change notifications so nothing polls. Entries for finished
 * runs are retained for a short while so the final numbers stay visible.
 */
import type { WorkflowMeta, WorkflowProgressEvent } from "./types.ts";
export type WorkflowExecutionStatus = "running" | "completed" | "failed";
export interface WorkflowAgentRecord {
    callIndex: number;
    label: string;
    phase: string | null;
    status: "queued" | "running" | "done" | "error";
    detail?: string;
    durationMs?: number;
    totalTokens?: number;
}
export interface WorkflowExecutionSnapshot {
    taskId: string;
    executionDir: string;
    outputFile: string;
    name: string;
    description: string;
    status: WorkflowExecutionStatus;
    error?: string;
    finishedAt?: number;
    /** Wall-clock so far (running) or total (finished). */
    durationMs: number;
    agentsTotal: number;
    agentsDone: number;
    agentsFailed: number;
    agentsRunning: number;
    totalTokens: number;
    phases: Array<{
        title: string;
        agents: WorkflowAgentRecord[];
    }>;
    logs: string[];
}
/**
 * Monotonic change counter; a stable primitive for useSyncExternalStore so
 * UI subscribers re-render only when the registry actually changes.
 */
export declare function getWorkflowExecutionsVersion(): number;
/** Subscribe to registry changes; returns an unsubscribe function. */
export declare function subscribeToWorkflowExecutions(listener: () => void): () => void;
export declare function registerWorkflowExecution(params: {
    taskId: string;
    executionDir: string;
    outputFile: string;
    meta: WorkflowMeta;
    startedAt?: number;
}): void;
/** Apply one engine progress event to a run. */
export declare function recordWorkflowProgress(taskId: string, event: WorkflowProgressEvent): void;
export declare function finishWorkflowExecution(taskId: string, outcome: {
    status: "completed" | "failed";
    error?: string;
}): void;
export declare function getWorkflowExecution(taskId: string): WorkflowExecutionSnapshot | null;
/** All retained runs, oldest first. */
export declare function listWorkflowExecutions(): WorkflowExecutionSnapshot[];
export declare function __resetWorkflowExecutionsForTests(): void;
//# sourceMappingURL=execution-registry.d.ts.map