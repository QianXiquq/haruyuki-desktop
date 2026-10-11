/**
 * Workflow tool: launches a workflow script that orchestrates multiple
 * subagents deterministically. The engine lives in @/tools/workflow; each
 * agent() call in the script runs in an agent-free ephemeral conversation via
 * @letta-ai/letta-agent-sdk (loaded lazily — see @/tools/workflow/sdk-loader).
 *
 * The run happens in the background: the tool validates the script, registers
 * a background task, and returns at once with the task id. Progress lines go
 * to the task's output file. Completion queues a task
 * notification through the message-queue bridge, exactly like background
 * Bash, Monitor, and background subagents, so all three host paths (TUI,
 * headless, listener) wake the model the same way.
 *
 * Listed in STREAMING_SHELL_TOOLS, so `signal`, `onOutput`, and `parentScope`
 * are injected into args (not part of the model-facing JSON schema).
 */
import type { SubagentSpawner, WorkflowProgressEvent } from "../workflow/types";
interface WorkflowArgs {
    script?: string;
    scriptPath?: string;
    args?: unknown;
    maxConcurrent?: number;
    model?: string;
    allowedTools?: string[];
    signal?: AbortSignal;
    onOutput?: (chunk: string, stream: "stdout" | "stderr") => void;
    parentScope?: {
        agentId: string;
        conversationId: string;
    };
}
interface WorkflowResult {
    toolReturn: string;
    status: "success" | "error";
}
/** What the tool needs from a subagent backend; the SDK spawner in production. */
export interface WorkflowSpawnerHandle {
    spawner: SubagentSpawner;
    cleanup(): Promise<void>;
}
type SpawnerFactory = (args: WorkflowArgs, setStage: (stage: string) => void) => Promise<WorkflowSpawnerHandle>;
export declare function createSdkSpawnerHandle(args: WorkflowArgs, setStage?: (stage: string) => void): Promise<WorkflowSpawnerHandle>;
/** Swap the subagent backend (tests inject a fake spawner). */
export declare function __setWorkflowSpawnerFactoryForTests(factory: SpawnerFactory | null): void;
export declare function __setWorkflowStartupTimeoutForTests(timeoutMs: number | null): void;
export declare function formatWorkflowProgressLine(event: WorkflowProgressEvent): string | null;
/**
 * Models routinely pass `args` as a JSON-encoded string despite the schema
 * asking for a real value, and the script then dies on `args.files.length`.
 * A string that is itself a JSON object or array is unambiguous: decode it.
 * Any other string stays a string.
 */
export declare function normalizeWorkflowArgs(value: unknown): unknown;
export declare function workflow(args: WorkflowArgs): Promise<WorkflowResult>;
export {};
//# sourceMappingURL=workflow.d.ts.map