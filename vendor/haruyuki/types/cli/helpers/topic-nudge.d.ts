export interface TopicNudgeNotice {
    /** User turns since the last marker when the nudge fired. */
    turnsSinceLastMarker: number;
    /** The configured threshold (`topic_nudge_turns`). */
    nudgeTurns: number;
}
/** The agent-facing reminder; it rides in the user message, never as a system role. */
export declare function formatTopicNudgeReminder(notice: TopicNudgeNotice): string;
/** The user-facing line: shown once, never sent. */
export declare function formatTopicNudgeHint(notice: TopicNudgeNotice): string;
//# sourceMappingURL=topic-nudge.d.ts.map