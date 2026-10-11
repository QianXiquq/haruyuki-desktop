/**
 * Topic listing and user-picked trims (feature ③, D-104).
 *
 * The planning itself is pure and lives in `topic-compaction.ts`; this module is
 * the I/O shell around it: it reads the in-context list and the transcript
 * markers, resolves the retained-token target from the compression rate and the
 * length of that transcript, asks the existing sliding-window summarizer for the
 * summary, and writes the result through the single in-context rewrite path
 * (`local-context-rewrite.ts`) — then refreshes the frozen prefix, because a trim
 * *is* the "compaction" application point.
 *
 * It runs against a port object rather than the backend so the ordering — and the
 * "nothing to trim must not write anything" rule — can be tested without a
 * provider, exactly like the rewrite path it delegates to.
 */
import type { LocalPiModelsRuntime } from "../dev/pi-models-runtime";
import { type LocalCompactionStats, type LocalCompleteFunction } from "./compaction";
import type { LocalCompactionStoreResult, LocalConversationRewriteInput } from "./local-context-rewrite";
import type { LocalMessage } from "./local-message";
import type { LocalAgentRecord } from "./local-store";
import { type LocalTopicMarker, type TopicBlock, type TrimNoopReason, type TrimStartSource } from "./topic-compaction";
/** The user's pick: a 1-based block index, or "just use the ratio". */
export type LocalTopicTrimPick = {
    kind: "topic";
    index: number;
} | {
    kind: "ratio_suggestion";
};
export interface LocalTopicTrimSettings {
    /**
     * The compression rate: the share of the in-context transcript each trim
     * compresses away. `0.3` means "compress about 30%, keep about 70%".
     */
    slidingWindowPercentage: number;
    prompt?: string | null;
    clipChars?: number | null;
}
/**
 * Everything this module needs from the backend. Each member maps to one
 * existing backend responsibility, so no policy is duplicated here.
 */
export interface LocalTopicTrimPorts {
    resolveAgentId(conversationId: string): string;
    listMessages(conversationId: string, agentId: string): LocalMessage[];
    readMarkers(conversationId: string, agentId: string): LocalTopicMarker[];
    contextWindow(conversationId: string, agentId: string): number | undefined;
    /** The frozen agent, so the summary runs on the model the prefix pinned. */
    resolveSummarizerAgent(conversationId: string, agentId: string): LocalAgentRecord;
    compactionSettings(conversationId: string, agentId: string): LocalTopicTrimSettings;
    rewrite(input: LocalConversationRewriteInput): LocalCompactionStoreResult;
    /** Re-apply the frozen prefix after the context changed. */
    refreshFrozenPrefix(conversationId: string, agentId: string): Promise<void>;
    /**
     * The rewrite ended the unmarked stretch, so the next nudge starts a new streak
     * (D-114 + M-4). Called only after a successful write: a refusal wrote nothing
     * and must leave the one-shot flag alone.
     */
    clearTopicNudgeStreak?(conversationId: string, agentId: string): void;
    onCompactionStart?(conversationId: string, agentId: string, trigger: string): void | Promise<void>;
    onCompactionEnd?(conversationId: string, agentId: string, trigger: string, stats: LocalCompactionStats): void | Promise<void>;
    complete?: LocalCompleteFunction;
    storageDir: string;
    modelsRuntime?: LocalPiModelsRuntime;
}
export interface LocalTopicMarkerView {
    marker: LocalTopicMarker;
    /** False once a trim moved the anchor out of the context. */
    anchorInContext: boolean;
}
export interface LocalTopicList {
    /** Blocks cut at the effective boundaries, oldest first, trailing one included. */
    blocks: TopicBlock[];
    /** Every marker in the transcript, oldest first, for `/topics --all`. */
    markers: LocalTopicMarkerView[];
    contextMessageCount: number;
    contextTokens: number;
    contextWindow?: number;
    /**
     * The most a cut may keep: `(1 - compressionRate) x contextTokens`.
     * `Infinity` when the transcript length cannot be measured, which keeps
     * everything rather than compressing blindly.
     */
    retentionCapTokens: number;
    /**
     * Block the compression rate would keep, computed by the same planner that
     * executes the trim so the picker's default and the actual cut agree. `1` (or
     * `null` for an empty context) means the rate keeps everything.
     */
    suggestedBlockIndex: number | null;
}
export interface LocalTopicTrimOutcome {
    /** False when the request resolved to a no-op; nothing was written. */
    executed: boolean;
    source: TrimStartSource;
    noopReason?: TrimNoopReason;
    /** The topic the kept region starts in (`null` = the current topic). */
    topicTitle: string | null;
    summarizedTitles: string[];
    boundaryAdjusted: boolean;
    ratioCapApplied: boolean;
    /** User turns the effective boundary was rewound from the marker anchor. */
    rewindTurns: number;
    numMessagesBefore: number;
    numMessagesAfter: number;
    summarizedMessageCount: number;
    /** Tokens in the region that was summarized away. */
    summarizedTokens: number;
    /** Retention the request asked for, before the compression-rate cut. */
    requestedRetentionTokens: number;
    retainedTokens: number;
    /** `null` when the transcript length — and therefore the target — is unknown. */
    retentionCapTokens: number | null;
    contextWindow?: number;
    /** The kept region, so a receipt can name its first message. */
    firstKeptMessageId?: string;
    /** Exactly what was persisted on the `compaction` row. */
    stats: LocalCompactionStats;
}
/**
 * The retained-token target: `(1 - compressionRate) x contextTokens`.
 *
 * The base is the length being compressed — the in-context transcript — not the
 * model's window. A trim compresses that transcript by the configured rate, and
 * the rule the cap enforces is that a cut may never *keep* more than the rate
 * allows, whether the cut point came from a topic pick or from the rate itself.
 * The window only decides when a turn is refused
 * (`backend/dev/provider-turn-executor.ts`), never how much a trim keeps.
 *
 * The rate is normalized by the same helper the sliding-window planner uses, so
 * a `0`, negative, or `NaN` percentage cannot mean different things in the two
 * places (`0` and below compress the smallest step, above `1` compresses
 * everything). A length that cannot be measured has no target: `Infinity`
 * keeps everything, so an unmeasurable transcript is never compressed blindly.
 */
export declare function retentionCapTokensFor(contextTokens: number | undefined, percentage: number): number;
/**
 * Whether the picker has anything to choose between.
 *
 * A list with a single block has no choice to offer and the compression rate
 * decides instead (D-119). Markers alone are not the test — a marker whose
 * effective boundary clamps onto the start of the context produces no block of
 * its own (a `/topic` in the first turns, or every anchor trimmed away), so
 * opening the picker would leave the user with one row and no way to cut.
 */
export declare function hasSelectableTopicBlocks(list: LocalTopicList): boolean;
export declare function listLocalTopics(ports: LocalTopicTrimPorts, input: {
    conversationId: string;
    agentId?: string;
    rewindTurns?: number;
}): LocalTopicList;
/**
 * Ask the summarizer to structure its output by topic.
 *
 * The titles are the ones being evicted, oldest first. With no titles the prompt
 * is passed through untouched, so an unmarked region summarizes exactly as it did
 * before this feature.
 *
 * The section requirement is inserted *before* the base prompt's final paragraph —
 * which is where the built-in prompt states its word limit and output rule — so
 * "every topic must have a section" is not competing with an instruction that
 * arrives after it. A single-paragraph custom prompt has no such trailing rule,
 * and gets the requirement appended.
 */
export declare function topicSectionPrompt(basePrompt: string, titles: readonly string[]): string;
/**
 * Execute a user-picked trim: summarize everything before the picked boundary
 * and rewrite the in-context list as `[summary, ...kept]`.
 *
 * Every refusal path returns `executed: false` with a structured reason and
 * writes nothing — a trim that cannot honor the request must not half-apply.
 */
export declare function trimLocalConversationToTopic(ports: LocalTopicTrimPorts, input: {
    conversationId: string;
    agentId?: string;
    pick: LocalTopicTrimPick;
    rewindTurns?: number;
    trigger?: string;
}): Promise<LocalTopicTrimOutcome>;
//# sourceMappingURL=local-topic-trim.d.ts.map