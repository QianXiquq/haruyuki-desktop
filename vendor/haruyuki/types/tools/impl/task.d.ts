/**
 * Task tool implementation
 *
 * Spawns specialized subagents to handle complex, multi-step tasks autonomously.
 * Supports both built-in subagent types and custom subagents defined in .haruyuki/agents/.
 */
import { completeSubagent, generateSubagentId, getSnapshot as getSubagentSnapshot, registerSubagent } from "../../agent/subagent-state.js";
import { type SubagentConfig, type SubagentMemoryScope } from "../../agent/subagents";
import { spawnSubagent } from "../../agent/subagents/manager";
import { runSubagentStopHooks } from "../../hooks";
import type { SubagentLaunchArgs, SubagentLaunchResult } from "../../types/subagent-protocol";
import { addToMessageQueue } from "../../utils/message-queue-bridge.js";
import { formatTaskNotification } from "../../utils/task-notifications.js";
import { copyGitHubPullRequestTags } from "./github-pull-request-tracker.js";
interface TaskArgs extends Partial<SubagentLaunchArgs> {
    command?: "run" | "refresh";
    toolCallId?: string;
    signal?: AbortSignal;
    parentScope?: {
        agentId: string;
        conversationId: string;
    };
}
export { waitForBackgroundSubagentAgentId, waitForBackgroundSubagentConversationId, waitForBackgroundSubagentLink, } from "../../agent/subagents/background-link";
export interface SpawnBackgroundSubagentTaskArgs {
    subagentType: string;
    /** Configuration resolved by the caller; omitted by legacy internal callers. */
    config?: SubagentConfig;
    /** User-facing task type; execution still uses subagentType. */
    displayType?: string;
    prompt: string;
    description: string;
    /**
     * Exact model handle for a harness caller: used verbatim, with no resolution
     * or fallback. Agent-facing launches never set it — a Letta subagent runs the
     * parent conversation's model, and `launchSubagent` rejects the `model`
     * argument for them.
     */
    exactModelHandle?: string;
    /** Replace the subagent's configured system prompt/persona (advanced). */
    systemPromptOverride?: string;
    toolCallId?: string;
    existingAgentId?: string;
    existingConversationId?: string;
    /** Identity for this child's initial input only. */
    clientMessageId?: string;
    maxTurns?: number;
    forkedContext?: boolean;
    /** Parent conversation scope for routing notifications in listener mode. */
    parentScope?: {
        agentId: string;
        conversationId: string;
    };
    /** Transcript/payload file exposed as TRANSCRIPT_PATH for reflection prompts. */
    transcriptPath?: string;
    /** Optional exact memory scope for harness-created memory worktrees. */
    memoryScope?: SubagentMemoryScope;
    /**
     * Optional computer selector passed to the child as `--computer`.
     * The child routes its turn to that connected computer and fails fast
     * if the device is offline, ambiguous, or too old to support routing.
     */
    environment?: string;
    /**
     * When true, skip injecting the completion notification into the primary
     * agent's message queue and hide from SubagentGroupDisplay.
     * Use `onComplete` to show a user-facing notification without leaking
     * into the agent's context.
     */
    silentCompletion?: boolean;
    /**
     * Harness-triggered conflict repair: the attempt token from
     * `claimMemoryConflictRepair`. The worker records its outcome under it and
     * skips if another worker already resolved the conflict.
     */
    memoryRepairToken?: string;
    /**
     * Emit a completion notification even when `silentCompletion` is true.
     * Useful when the parent should not stream subagent tokens but still wants
     * a normal task notification event.
     */
    emitCompletionNotification?: boolean;
    /**
     * Optional override for the completion notification summary.
     */
    completionSummary?: string | ((result: {
        success: boolean;
        error?: string;
    }) => string | Promise<string>);
    /**
     * Called after the subagent finishes (success or failure).
     * Runs regardless of `silentCompletion` and is awaited before
     * completion notifications/hooks continue.
     * `report` is the raw final subagent report and may be large; callbacks
     * should parse/summarize it rather than injecting it directly into context.
     */
    onComplete?: (result: {
        success: boolean;
        error?: string;
        agentId?: string;
        conversationId?: string;
        model?: string;
        stepCount?: number;
        durationMs?: number;
        report?: string;
    }) => void | Promise<void>;
    /**
     * Optional dependency overrides for tests.
     * Production callers should not provide this.
     */
    deps?: Partial<SpawnBackgroundSubagentTaskDeps>;
}
export interface SpawnBackgroundSubagentTaskResult {
    taskId: string;
    outputFile: string;
    subagentId: string;
}
interface SpawnBackgroundSubagentTaskDeps {
    spawnSubagentImpl: typeof spawnSubagent;
    copyGitHubPullRequestTagsImpl: typeof copyGitHubPullRequestTags;
    addToMessageQueueImpl: typeof addToMessageQueue;
    formatTaskNotificationImpl: typeof formatTaskNotification;
    runSubagentStopHooksImpl: typeof runSubagentStopHooks;
    generateSubagentIdImpl: typeof generateSubagentId;
    registerSubagentImpl: typeof registerSubagent;
    completeSubagentImpl: typeof completeSubagent;
    getSubagentSnapshotImpl: typeof getSubagentSnapshot;
}
/**
 * Spawn a background subagent task and return task metadata immediately.
 * Notification/hook behavior is identical to Task's background path.
 */
export declare function spawnBackgroundSubagentTask(args: SpawnBackgroundSubagentTaskArgs): SpawnBackgroundSubagentTaskResult;
/** Launch through the same task lifecycle for tools and App Server commands. */
export declare function launchSubagent(args: TaskArgs): Promise<SubagentLaunchResult>;
/** Agent's text adapter; App Server callers consume launchSubagent directly. */
export declare function task(args: TaskArgs): Promise<string>;
//# sourceMappingURL=task.d.ts.map