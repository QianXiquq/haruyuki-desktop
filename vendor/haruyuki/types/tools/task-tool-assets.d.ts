import type { JsonSchema } from "./model-facing-tool";
/**
 * Remove the `computer` parameter from the Task tool schema. Used when the
 * backend has no environment routing (local backend, self-hosted or remote
 * app server): the computers concept only exists on Letta Cloud, so the
 * option should not be advertised to the model at all.
 */
export declare function stripComputerFromTaskSchema(schema: JsonSchema): JsonSchema;
/**
 * Remove the "Running on Another Computer" section from the Task tool
 * description (the heading and everything up to the next `## ` heading).
 */
export declare function stripComputerFromTaskDescription(description: string): string;
/**
 * Adjust a bundled tool's model-facing assets for the active backend. Only
 * Task varies today: it advertises `computer` only when the backend can route
 * work to another environment.
 */
export declare function resolveBackendSpecificToolAssets(name: string, description: string, inputSchema: JsonSchema): Promise<{
    description: string;
    inputSchema: JsonSchema;
}>;
//# sourceMappingURL=task-tool-assets.d.ts.map