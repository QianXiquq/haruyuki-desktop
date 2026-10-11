import type { LocalMessage } from "./local-message";
export declare const DEFAULT_TOPIC_BOUNDARY_REWIND_TURNS = 2;
export declare const MAX_TOPIC_BOUNDARY_REWIND_TURNS = 3;
export declare const DEFAULT_TOPIC_MARKER_WARN_TURNS = 10;
export declare const DEFAULT_TOPIC_MARKER_REJECT_TURNS = 5;
export declare const DEFAULT_TOPIC_NUDGE_TURNS = 50;
/** A transcript `topic` entry, projected to what the planner needs. */
export interface LocalTopicMarker {
    id: string;
    title: string;
    createdBy: "agent" | "user";
    anchorMessageId: string | null;
    createdAt: string;
}
export interface TopicBlock {
    /** 1-based, oldest to newest. */
    index: number;
    /**
     * The topic this block belongs to — the marker that *ends* it. `null` for the
     * trailing "current topic (not marked finished)" block.
     */
    title: string | null;
    markerId: string | null;
    createdBy: "agent" | "user" | null;
    /** Where that ending marker was written (display only; boundaries are older). */
    anchorMessageId: string | null;
    /**
     * Titles of markers whose boundary was clamped onto this block (they were too
     * close to the previous marker to delimit a block of their own).
     */
    absorbedTitles: string[];
    /** First message of the block: the effective boundary that starts it. */
    boundaryMessageId: string;
    /** Inclusive/exclusive indices into the in-context list. */
    startIndex: number;
    endIndex: number;
    /**
     * User turns rewound to derive this block's start — that is, the rewind that
     * applied to the *previous* marker. `0` for the first block and whenever the
     * start is the beginning of the context.
     */
    rewindTurns: number;
    /** Anchor of the marker that starts this block (`null` for the first block). */
    startMarkerAnchorMessageId: string | null;
    messageCount: number;
    tokens: number;
    /** Creation time of the block's first message. */
    startsAt: string;
    /** A one-message block is not worth cutting on its own. */
    sparse: boolean;
}
export type TrimStartSource = "topic_pick" | "ratio_suggestion" | "ratio_cap";
export type TrimNoopReason = "empty_context" | "nothing_before_boundary" | "unknown_block" | "no_suggestion";
export type TrimBoundaryAdjustReason = "start_message_not_in_context" | "start_split_tool_pair" | "no_safe_start";
export interface TrimPlan {
    /** Index of the first kept message; `0` means nothing is trimmed. */
    startIndex: number;
    /**
     * The boundary the request asked for, before the retention cap moved it. Equals
     * `startIndex` unless `ratioCapApplied`; it is what a receipt reports as the
     * *requested* retention so the cap override is visible in the numbers, not only
     * in the `source` label.
     */
    requestedStartIndex: number;
    summarize: readonly LocalMessage[];
    /** What stays in context; a no-op plan keeps everything. */
    keep: readonly LocalMessage[];
    source: TrimStartSource;
    /** Name of the topic the kept region starts in (`null` = current topic). */
    topicTitle: string | null;
    /** Names of the topics folded into the new summary, oldest first. */
    summarizedTitles: readonly string[];
    /** The requested boundary had to move to a safe start. */
    boundaryAdjusted: boolean;
    boundaryAdjustReason?: TrimBoundaryAdjustReason;
    /** True when the retention cap overrode the picked topic boundary. */
    ratioCapApplied: boolean;
    noop?: boolean;
    noopReason?: TrimNoopReason;
}
export interface TopicMarkerGateVerdict {
    status: "accepted" | "warned" | "rejected";
    /** User turns still needed before the gate stops complaining (0 = none). */
    turnsUntilAllowed: number;
}
/** Messages that start a user turn. A compaction summary is not a user turn. */
export declare function isLocalUserTurnMessage(message: LocalMessage): boolean;
/**
 * Clamp a configured boundary rewind to the supported range.
 *
 * `undefined`, a non-finite value, or a negative one is *unusable* and falls back
 * to the default — the same rule the other four knobs use, so an out-of-range
 * setting can never silently mean "no rewind at all".
 */
export declare function normalizeTopicBoundaryRewindTurns(value: number | undefined): number;
/**
 * Split the in-context list into topic blocks, oldest first. The trailing block
 * is the current, not-yet-marked topic (`title: null`) and always exists when
 * the context is non-empty.
 *
 * A block is the region `(boundary[i-1], boundary[i]]`: its `title` names the
 * topic that ends there (marker `i`), while `rewindTurns` and
 * `startMarkerAnchorMessageId` describe how its *start* was derived from the
 * previous marker.
 */
export declare function listTopicBlocks(messages: readonly LocalMessage[], markers: readonly LocalTopicMarker[], options?: {
    rewindTurns?: number;
}): TopicBlock[];
/**
 * Start of the largest keep-region that fits `retentionCapTokens`, walking back
 * from the newest message. Returns the start of that region, or `null` for an
 * empty context. A single message over the cap is kept rather than summarized.
 *
 * The cap is the compression rate's cut for the current transcript, computed by
 * the caller (`(1 - rate) x transcript tokens`), so this function is both the
 * rate's own cut point and the limit every topic pick is measured against.
 */
export declare function ratioSuggestionMessageId(messages: readonly LocalMessage[], retentionCapTokens: number): string | null;
export declare function alignTrimBoundary(messages: readonly LocalMessage[], startMessageId: string): {
    startIndex: number;
    adjusted: boolean;
    reason?: TrimBoundaryAdjustReason;
};
/**
 * Decide where a user-initiated trim starts.
 *
 * A topic pick is honored only while it keeps at most `retentionCapTokens`;
 * otherwise the rate's own position wins and the plan reports `ratio_cap`,
 * because the compression rate is a hard limit and the topic boundary is
 * best-effort. This is what makes the first block a legal pick: "keep
 * everything" never survives the rate, so it resolves to the same cut the rate
 * would have made instead of refusing outright.
 */
export declare function resolveTrimPlan(input: {
    messages: readonly LocalMessage[];
    blocks: readonly TopicBlock[];
    pick: {
        kind: "topic";
        index: number;
    } | {
        kind: "ratio_suggestion";
    };
    retentionCapTokens: number;
}): TrimPlan;
/**
 * Frequency gate for `TopicMark`, measured in user turns since the previous
 * marker. `0` disables a threshold; the user's own `/topic` command does not
 * consult this.
 */
export declare function evaluateTopicMarkerGate(input: {
    turnsSincePrevious: number;
    warnTurns?: number;
    rejectTurns?: number;
}): TopicMarkerGateVerdict;
export type TopicNudgeReason = "due" | "disabled" | "below_threshold" | "already_sent";
export interface TopicNudgeDecision {
    due: boolean;
    /** Why — structured, so a receipt or a log never has to guess. */
    reason: TopicNudgeReason;
    turnsSinceLastMarker: number;
    nudgeTurns: number;
}
/**
 * One-shot nudge after `nudgeTurns` user turns without a marker. The caller
 * persists `alreadySentForStreak`, so a long unmarked stretch nudges once and a
 * new marker (or a trim) starts the next streak.
 *
 * `nudgeTurns = 0` disables the nudge (D-115) and leaves the flag alone. The
 * threshold is compared *before* the flag so a stale flag stays distinguishable:
 * a flag that is set while the stretch is below the threshold means the stretch
 * it belonged to ended (a new marker, or a trim), and the caller clears it.
 * Reporting that as "already_sent" would hide the reset.
 */
export declare function decideTopicNudge(input: {
    turnsSinceLastMarker: number;
    nudgeTurns?: number;
    alreadySentForStreak: boolean;
}): TopicNudgeDecision;
/**
 * User turns since the last marker's anchor, or since the start of the context
 * when there is no marker (or its anchor left the context). Feeds both the
 * frequency gate and the nudge.
 */
export declare function userTurnsSinceLastTopicMarker(messages: readonly LocalMessage[], markers: readonly LocalTopicMarker[]): number;
//# sourceMappingURL=topic-compaction.d.ts.map