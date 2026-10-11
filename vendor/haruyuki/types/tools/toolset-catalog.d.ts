import type { ToolName } from "./tool-definitions";
import type { ToolsetName, ToolsetOption, ToolsetPreference } from "./toolset-types";
interface ToolsetDefinition extends Omit<ToolsetOption, "id"> {
    tools: readonly ToolName[];
}
export declare const WORKTREE_TOOL_NAMES: Set<"ApplyPatch" | "Bash" | "Write" | "Edit" | "Read" | "ViewImage" | "Grep" | "Glob" | "LS" | "TaskCreate" | "TaskGet" | "TaskList" | "TaskUpdate" | "exec_command" | "write_stdin" | "UpdatePlan" | "Task" | "Workflow" | "TopicMark" | "AskUserQuestionAsync" | "EnterWorktree" | "ExitWorktree" | "TaskStop" | "Monitor" | "WatchPR" | "read_artifact_file" | "Wake" | "ReadLSP" | "SetWorkingDirectory" | "Skill" | "write_artifact_file">;
/**
 * Presets in picker order. Availability filters and explicit allowlists apply afterward.
 *
 * `TopicMark` is an optional family that ships in every non-empty preset. The
 * frozen prompt chapter and the one-shot nudge both tell the model to call it, so
 * a preset that omits it would advertise a tool the payload cannot carry;
 * `declaration-gates.ts` removes it again on the cloud backend and when the switch
 * is off. The `none` preset declares no built-in tools at all, which is why
 * `shouldAdvertiseTopicMarking` also consults the toolset.
 */
export declare const TOOLSET_CATALOG: Readonly<Record<ToolsetName, ToolsetDefinition>>;
/** Auto selects a preset; client-facing options omit the internal tool lists. */
export declare const TOOLSET_OPTIONS: readonly ToolsetOption[];
export declare function isToolsetPreference(value: unknown): value is ToolsetPreference;
export {};
//# sourceMappingURL=toolset-catalog.d.ts.map