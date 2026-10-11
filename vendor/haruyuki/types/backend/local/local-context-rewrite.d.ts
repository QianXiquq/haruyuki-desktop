import type { LocalCompactionStats } from "./compaction";
import type { LocalMessage } from "./local-message";
import type { LocalConversationContextManagement, StoredConversation } from "./local-types";
import { type LocalTopicMarker } from "./topic-compaction";
export interface LocalCompactionStoreResult {
    numMessagesBefore: number;
    numMessagesAfter: number;
    summaryMessage: LocalMessage;
}
export interface LocalConversationRewriteInput {
    conversationId: string;
    agentId: string;
    /** Raw summary text recorded on the summary message's compaction metadata. */
    summary: string;
    /** Packed summary content the model will read. */
    packedSummary: string;
    stats?: LocalCompactionStats;
    /** Messages kept after the summary, in order. */
    remainingMessages?: LocalMessage[];
}
export interface LocalTopicMarkerAppendInput {
    conversationId: string;
    agentId: string;
    title: string;
    summary?: string;
    createdBy: "agent" | "user";
}
export interface LocalTopicMarkerAppendResult {
    marker: LocalTopicMarker;
    /** Transcript entry id, for receipts and follow-up lookups. */
    entryId: string;
    /** User turns since the previous marker, as of this write. */
    turnsSincePrevious: number;
    /** In-context messages at write time (`0` means there was no anchor). */
    contextMessageCount: number;
}
/** Transcript persistence options shared with `LocalStore`. */
export interface LocalTranscriptPersistOptions {
    transcript?: "append" | "append-compaction" | "rewrite" | "skip";
    message?: LocalMessage;
    compaction?: {
        summaryMessage: LocalMessage;
        summary: string;
        firstKeptMessageId?: string;
        previousMessages?: readonly LocalMessage[];
        stats?: LocalCompactionStats;
    };
}
/**
 * Everything the rewrite path needs from the store. Each member maps to one
 * store responsibility so the sequencing below stays readable.
 */
export interface LocalContextRewritePorts {
    ensureConversation(conversationId: string, agentId: string): StoredConversation;
    conversationKey(conversationId: string, agentId: string): string;
    /** `undefined` for an in-memory store with no transcript to write. */
    conversationMessagesPath(key: string): string | undefined;
    /** Load (and validate) the resident window before it is replaced. */
    ensureResidentMessages(conversationId: string, agentId: string): void;
    inContextMessages(conversationId: string, agentId: string): readonly LocalMessage[];
    validateUnreadTranscriptHead(key: string): void;
    nextLocalMessageId(): string;
    currentLocalMessageDate(): string;
    setResidentMessages(key: string, messages: LocalMessage[]): void;
    saveConversation(key: string, conversation: StoredConversation): void;
    persistConversation(conversationId: string, agentId: string, options: LocalTranscriptPersistOptions): void;
    rebuildMessageIndex(): void;
    now(): string;
    ensureTranscriptHeader(conversation: StoredConversation, messagesPath: string): void;
    nextSessionEntryId(key: string): string;
    lastSessionEntryId(key: string): string | null;
    recordSessionEntryId(key: string, entryId: string): void;
}
export declare class LocalContextRewrites {
    private readonly ports;
    constructor(ports: LocalContextRewritePorts);
    /**
     * The conversation's small context-management state (§2.2). A damaged or
     * unknown shape reads as "nothing recorded": the flag only ever gates a
     * reminder, so refusing to guess is enough.
     */
    readContextManagement(conversationId: string, agentId: string): LocalConversationContextManagement;
    /**
     * Record whether the no-marker nudge has gone out for the current streak.
     *
     * This is the only conversation-level write in this module: it touches
     * neither the context nor the transcript (`transcript: "skip"`), because the
     * flag is bookkeeping, not conversation content. Writing the same value again
     * is a no-op, so a reader can call it on every turn.
     */
    setTopicNudgeSent(conversationId: string, agentId: string, sent: boolean): void;
    /**
     * Every topic marker in the conversation transcript, oldest first.
     *
     * Reads the transcript file rather than the resident window on purpose: a
     * trim keeps every marker, so a marker can sit far before the window. Callers
     * are user commands and trim execution, never the per-turn request path.
     * Damaged rows are skipped.
     */
    readTopicMarkers(conversationId: string, agentId: string): LocalTopicMarker[];
    /**
     * Append a topic marker to the transcript. Markers are metadata: the context,
     * the in-context id list, and the message index are untouched, so a marker
     * never disturbs the frozen request prefix.
     *
     * The anchor is the newest in-context message at write time. An empty context
     * yields a `null` anchor (and `contextMessageCount: 0`), which callers treat
     * as "cannot mark here".
     */
    appendTopicMarker(input: LocalTopicMarkerAppendInput): LocalTopicMarkerAppendResult;
    /**
     * Copy a parent's topic markers into a fork.
     *
     * Messages are cloned with fresh ids, so an inherited marker's anchor has to be
     * remapped onto the child's copy of that message; a marker whose anchor fell
     * outside the forked prefix (a cutoff fork) is dropped rather than left
     * dangling. The child's rows get their own entry chain, so later marking in
     * either conversation stays independent (requirement §6, "会话 fork").
     *
     * Returns how many markers were copied, for tests and telemetry.
     */
    copyTopicMarkersForFork(input: {
        sourceConversationId: string;
        sourceAgentId: string;
        targetConversationId: string;
        targetAgentId: string;
        /** Parent message id -> the child message id holding the same message. */
        anchorIds: ReadonlyMap<string, string>;
    }): number;
    /**
     * Replace a conversation's in-context list with `[summary, ...remaining]` and
     * append the matching `compaction` entry to the transcript.
     *
     * This is the single write path for "history became a summary": both the
     * sliding-window compaction and a user-picked topic trim go through it, so the
     * transcript, the resident window, and the message index can only be mutated
     * one way.
     */
    rewriteInContext(input: LocalConversationRewriteInput): LocalCompactionStoreResult;
    /**
     * Append a `topic` row. Unlike message and compaction rows it carries no
     * `message`, so it only joins the entry-id and parent-chain bookkeeping —
     * never the message-id maps or the persisted message snapshots. That is what
     * keeps markers out of every content reader.
     */
    private appendTopicEntry;
}
//# sourceMappingURL=local-context-rewrite.d.ts.map