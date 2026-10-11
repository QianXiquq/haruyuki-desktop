import type { ToolName } from "./tool-definitions";
export declare function filterWorktreeTools(toolNames: ToolName[]): ToolName[];
/**
 * Whether the declared payload may carry `TopicMark`: the switch is on *and* the
 * backend is local. Markers are rows in the local transcript, and the cloud
 * backend manages context server-side, so declaring the tool there would only
 * add a tool that cannot do anything.
 *
 * The check deliberately does not *create* a backend: this runs while a payload is
 * being built, so an already-created backend is classified directly, and an
 * absent one falls back to the configured mode — which is always local now, so
 * it counts as local (L-12).
 */
export declare function shouldDeclareTopicMarkingTool(): boolean;
/** Remove the marker tool from a declared registry, not from execution. */
export declare function filterDeclaredTopicMarkingTools<T>(registry: Map<string, T>): Map<string, T>;
//# sourceMappingURL=declaration-gates.d.ts.map