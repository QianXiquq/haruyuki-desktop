export type SharedReminderMode = "interactive" | "headless-one-shot" | "headless-bidirectional" | "listen" | "subagent";
export type SharedReminderId = "session-context" | "conversation-bootstrap" | "agent-info" | "secrets-info" | "mcp-servers-info" | "permission-mode" | "memory-git-sync" | "command-io" | "toolset-change" | "disk-space" | "topic-nudge";
export interface SharedReminderDefinition {
    id: SharedReminderId;
    description: string;
    modes: SharedReminderMode[];
}
export declare const SHARED_REMINDER_CATALOG: ReadonlyArray<SharedReminderDefinition>;
export declare const SHARED_REMINDER_IDS: SharedReminderId[];
export declare function reminderEnabledInMode(id: SharedReminderId, mode: SharedReminderMode): boolean;
//# sourceMappingURL=catalog.d.ts.map