import type { ContextTracker } from "../cli/helpers/context-tracker";
import type { TopicNudgeNotice } from "../cli/helpers/topic-nudge";
import type { PermissionMode } from "../permissions/mode";
export interface CommandIoReminder {
    input: string;
    output: string;
    success: boolean;
    /** Extra context appended only in the agent-facing reminder, not shown in the UI. */
    agentHint?: string;
}
export interface ToolsetChangeReminder {
    source: string;
    previousToolset: string | null;
    newToolset: string | null;
    previousTools: string[];
    newTools: string[];
}
export interface MemoryGitSyncReminder {
    text: string;
}
export type SessionContextReason = "initial_attach" | "cwd_changed" | "post_compaction";
export interface SharedReminderState {
    hasSentAgentInfo: boolean;
    hasSentSessionContext: boolean;
    hasSentConversationBootstrap: boolean;
    pendingConversationBootstrap: boolean;
    hasSentSecretsInfo: boolean;
    pendingSecretsInfoRefresh: boolean;
    lastSentSecretNamesKey: string | null;
    hasSentMcpServersInfo: boolean;
    lastSentMcpServerNamesKey: string | null;
    /** Counts may be cached, but attachment discovery must run every turn. */
    mcpToolCounts: Map<string, {
        toolCount: number | null;
        fetchedAtMs: number;
    }>;
    lastNotifiedPermissionMode: PermissionMode | null;
    turnCount: number;
    pendingReflectionTrigger: boolean;
    pendingMemoryGitSyncReminders: MemoryGitSyncReminder[];
    pendingCommandIoReminders: CommandIoReminder[];
    pendingToolsetChangeReminders: ToolsetChangeReminder[];
    /** True once the current low-disk episode has been reported. */
    hasNotifiedLowDiskSpace: boolean;
    /** When set, the next session-context reminder uses this reason for its intro text. */
    pendingSessionContextReason?: SessionContextReason;
    /**
     * A topic nudge delivered with this turn (feature ③, D-114). The engine sets
     * it while building the agent-facing reminder; the TUI is the only channel
     * that can show the user their half, and it clears the field once printed.
     */
    pendingTopicNudge: TopicNudgeNotice | null;
}
export declare function createSharedReminderState(): SharedReminderState;
export declare function resetSharedReminderState(state: SharedReminderState): void;
/**
 * Re-arm one-shot execution-context reminders that compaction can evict.
 * Preserve queued reminders and change-specific refresh state.
 */
export declare function markPostCompactionContextRemindersPending(state: SharedReminderState): void;
export declare function syncReminderStateFromContextTracker(state: SharedReminderState, contextTracker: ContextTracker): void;
export declare function enqueueCommandIoReminder(state: SharedReminderState, reminder: CommandIoReminder): void;
export declare function enqueueMemoryGitSyncReminder(state: SharedReminderState, reminder: MemoryGitSyncReminder): void;
export declare function enqueueToolsetChangeReminder(state: SharedReminderState, reminder: ToolsetChangeReminder): void;
export declare function markSecretsInfoReminderPending(state: SharedReminderState): void;
//# sourceMappingURL=state.d.ts.map