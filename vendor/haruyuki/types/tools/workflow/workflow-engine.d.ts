/**
 * The workflow engine: parses the meta block, builds the script-facing hooks
 * (agent / decide / parallel / pipeline / phase / log / args), executes the script
 * body inside a node:vm context, and appends every subagent outcome to the
 * run's journal.
 *
 * The engine is deliberately small: it schedules calls to the injected
 * spawner and nothing else. Everything a subagent does happens in the
 * spawner (sdk-spawner.ts in production).
 *
 * The vm context gives the script a clean global scope with only the hooks
 * in it. It is not a security boundary: the hooks are host-realm functions,
 * so a script can reach the host through them (node:vm documents this). The
 * script runs with the CLI's own privileges, like the Bash tool; the
 * approval prompt shows its source so the user approves what actually runs.
 */
import type { RunWorkflowOptions, SubagentSpawner, WorkflowExecutionResult } from "./types.ts";
export declare const DEFAULT_MAX_CONCURRENT = 16;
export declare function executeWorkflow(spawner: SubagentSpawner, options: RunWorkflowOptions): Promise<WorkflowExecutionResult>;
//# sourceMappingURL=workflow-engine.d.ts.map