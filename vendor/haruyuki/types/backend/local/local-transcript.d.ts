import type { LocalCompactionStats } from "./compaction";
import type { LocalMessage } from "./local-message";
import type { StoredConversation } from "./local-types";
export declare const LOCAL_TRANSCRIPT_LEGACY_SCHEMA_VERSION = 1;
export declare const LOCAL_TRANSCRIPT_SCHEMA_VERSION = 2;
export declare const LOCAL_TRANSCRIPT_LEGACY_MESSAGE_FORMAT = "pi-ai-message-jsonl";
export declare const LOCAL_TRANSCRIPT_MESSAGE_FORMAT = "pi-session-entry-jsonl";
export declare const LOCAL_TRANSCRIPT_PROVIDER_STACK = "pi-ai";
type LocalTranscriptSchemaVersion = typeof LOCAL_TRANSCRIPT_SCHEMA_VERSION | typeof LOCAL_TRANSCRIPT_LEGACY_SCHEMA_VERSION;
export type LocalTranscriptMessageFormat = typeof LOCAL_TRANSCRIPT_MESSAGE_FORMAT | typeof LOCAL_TRANSCRIPT_LEGACY_MESSAGE_FORMAT;
export interface LocalTranscriptManifest {
    schema_version: LocalTranscriptSchemaVersion;
    message_format: LocalTranscriptMessageFormat;
    provider_stack: typeof LOCAL_TRANSCRIPT_PROVIDER_STACK;
    created_at: string;
    migrated_from?: string;
    migrated_at?: string;
    backup_path?: string;
}
export declare class LocalTranscriptMigrationRequiredError extends Error {
    constructor(storageDir: string);
}
export declare class LocalTranscriptRepairRequiredError extends Error {
    constructor(storageDir: string, conversationDir: string);
}
export declare function localTranscriptMigrationCommand(storageDir: string): string;
export declare function transcriptManifestPath(conversationDir: string): string;
export declare function transcriptMessagesPath(conversationDir: string): string;
export declare function hasNonEmptyJsonl(path: string): boolean;
export declare function assertNoLegacyUiMessageRows(messages: readonly unknown[], storageDir: string, conversationDir: string): void;
interface LocalTranscriptSessionHeader {
    type: "session";
    version: 3;
    id: string;
    timestamp: string;
    cwd: string;
}
export interface LocalTranscriptEntryBase {
    id: string;
    parentId: string | null;
    timestamp: string;
}
export interface LocalTranscriptSessionMessageEntry extends LocalTranscriptEntryBase {
    type: "message";
    message: LocalMessage;
}
export interface LocalTranscriptCompactionEntry extends LocalTranscriptEntryBase {
    type: "compaction";
    summary: string;
    firstKeptEntryId: string | null;
    tokensBefore: number;
    message: LocalMessage;
    details?: {
        stats?: LocalCompactionStats;
    };
}
/**
 * A topic marker: the agent (or the user) declares that a topic ended here.
 * Markers are metadata, never context — they record where a topic boundary is,
 * not what the model sees. The effective boundary is derived at read time
 * (rewound a few user turns; see `topic-compaction.ts`), so a marker keeps its
 * original anchor and stays valid if that policy changes.
 */
export interface LocalTranscriptTopicEntry extends LocalTranscriptEntryBase {
    type: "topic";
    /** Short, searchable noun phrase (≤ 60 chars at the tool boundary). */
    title: string;
    /** Optional prose summary of the topic (≤ 600 chars at the tool boundary). */
    summary?: string;
    createdBy: "agent" | "user";
    /** Last in-context message id when the marker was written. */
    anchorMessageId: string | null;
    /** User turns since the previous marker, for sparsity reporting. */
    turnsSincePrevious: number;
}
export type LocalTranscriptSessionEntry = LocalTranscriptSessionHeader | LocalTranscriptSessionMessageEntry | LocalTranscriptCompactionEntry | LocalTranscriptTopicEntry;
/**
 * Entries a transcript reader treats as conversation content. `topic` entries
 * are deliberately excluded: a marker must never enter the in-context
 * projection, the message index, or search results.
 */
export type LocalTranscriptAppendEntry = LocalTranscriptSessionMessageEntry | LocalTranscriptCompactionEntry;
export interface LocalTranscriptRowsResult {
    messages: LocalMessage[];
    entryIds: Set<string>;
    entryIdByMessageId: Map<string, string>;
    messageById: Map<string, LocalMessage>;
    lastEntryId: string | null;
    sourceStartIndex: number;
}
export declare function localMessagesHaveSameSnapshot(a: LocalMessage, b: LocalMessage): boolean;
export declare function isLocalTranscriptTopicEntry(value: unknown): value is LocalTranscriptTopicEntry;
export declare function createLocalTranscriptSessionHeader(conversation: StoredConversation): LocalTranscriptSessionHeader;
export declare function localTranscriptSessionEntries(conversation: StoredConversation, messages: readonly LocalMessage[]): LocalTranscriptSessionEntry[];
export declare function localTranscriptRowsResult(rows: readonly unknown[], messageFormat: LocalTranscriptMessageFormat, activeMessageIds?: readonly string[]): LocalTranscriptRowsResult;
export declare function createLocalTranscriptManifest(input?: {
    migratedFrom?: string;
    migratedAt?: string;
    backupPath?: string;
}): LocalTranscriptManifest;
export declare function readJsonFile<T>(path: string): T | undefined;
export declare function readJsonlFile<T>(path: string): T[];
export declare function readJsonlFileSuffix<T>(path: string, maxBytes: number): {
    items: T[];
    reachedStart: boolean;
    startOffset: number;
};
export declare function jsonl<T>(items: readonly T[]): string;
export declare function validateLocalTranscriptManifest(conversationDir: string, storageDir: string): LocalTranscriptManifest | undefined;
export declare function writeLocalTranscriptManifest(conversationDir: string, manifest?: LocalTranscriptManifest): void;
export declare function isSyntheticLocalTimestamp(value: string | null | undefined): boolean;
export declare function timestampFromIso(value: string): number;
export declare function createdAtForLocalMessage(message: LocalMessage): string | undefined;
export declare function localMessageDate(message: LocalMessage, fallbackDate: string): string;
export interface LocalTranscriptTiming {
    createdAt?: string;
    updatedAt?: string;
}
export declare function transcriptTimingForConversationDir(conversationDir: string, manifest?: LocalTranscriptManifest): LocalTranscriptTiming;
export declare function repairSyntheticLocalMessageTimestamps(messages: LocalMessage[], timing: LocalTranscriptTiming): LocalMessage[];
export declare function repairSyntheticConversationTimestamps(conversation: StoredConversation, messages: LocalMessage[], timing: LocalTranscriptTiming): StoredConversation;
export declare function normalizeLocalMessageForPi(message: LocalMessage): LocalMessage;
export interface LocalTranscriptTailReadResult {
    transcript: LocalTranscriptRowsResult;
    messages: LocalMessage[];
}
/**
 * Shared parse pipeline for bounded transcript tail reads: rows already read
 * from a messages.jsonl suffix are converted to the normalized active-message
 * view (orphan tool results dropped) without applying the full-load repair
 * passes (timestamp interpolation, oversized tool-result clipping), which
 * remain owned by the full-read path in local-store.ts.
 */
export declare function localTranscriptTailMessages(rows: readonly unknown[], messageFormat: LocalTranscriptMessageFormat, activeMessageIds: readonly string[], storageDir: string, conversationDir: string): LocalTranscriptTailReadResult;
/**
 * Read the smallest messages.jsonl suffix that holds every in-context id (or
 * `minMessages` messages when there is no in-context list), starting at a
 * 64 KB window. Compacted-away rows older than the oldest in-context row stay
 * unread, so a compacted conversation never re-reads its whole history.
 *
 * `liveInContextIds` is the in-context list minus ids the returned messages
 * lack: ids with no row once the whole file was scanned (an in-flight
 * assistant id left by a killed process) and orphan tool results the repair
 * dropped. The returned window covers every live id.
 */
export declare function readLocalTranscriptTailWindow(messagesPath: string, messageFormat: LocalTranscriptMessageFormat, activeMessageIds: readonly string[], minMessages: number, storageDir: string, conversationDir: string): LocalTranscriptTailReadResult & {
    reachedStart: boolean;
    headBytes: number;
    liveInContextIds: string[];
};
/**
 * Evict resident messages that left the in-context set, oldest first, while
 * the window holds more than `floor` messages. In-context messages and the
 * newest message (appended but not yet recorded as in context) always stay.
 */
export declare function spliceOutOfContextMessages(messages: LocalMessage[], inContextIds: readonly string[], floor: number): LocalMessage[];
/** Messages of a replaced window whose ids the new window no longer holds. */
export declare function messagesMissingFrom(replaced: readonly LocalMessage[] | undefined, next: readonly LocalMessage[]): LocalMessage[];
/**
 * Whether a resident window holds every active id, so readers can serve the
 * logical list from it without touching disk.
 */
export declare function residentCoversIds(resident: readonly LocalMessage[], activeMessageIds: readonly string[]): boolean;
/**
 * One-time validation of the transcript head a bounded tail read never
 * parsed, before the first append mutates anything. Parses each head line
 * and applies the legacy-row check to raw rows and to the in-context
 * messages the head holds, so a corrupt head blocks writes like the full
 * read it replaces.
 */
export declare function validateUnreadTranscriptHead(messagesPath: string, headBytes: number, storageDir: string, conversationDir: string, activeMessageIds: readonly string[]): void;
/**
 * Session-entry bookkeeping for a resident/active tail. The suffix parse may
 * contain historical JSONL rows (especially after compaction, which appends
 * rather than rewriting); persist and session maps must not pin those.
 */
export declare function restrictLocalTranscriptToResidentMessages(transcript: LocalTranscriptRowsResult, residentMessages: readonly LocalMessage[]): LocalTranscriptRowsResult;
/**
 * Merge the authoritative on-disk message list with the resident tail window.
 * The resident window is a suffix of the logical message list: disk rows not
 * in the window come first, then the window in its own order (resident entries
 * win by id — they may carry newer in-progress content, and a resident-only
 * id is a trailing message not yet persisted). Order-preserving merge: the
 * model must never see history resequenced.
 */
export declare function overlayResidentLocalMessageTail(diskMessages: readonly LocalMessage[], residentTail: readonly LocalMessage[]): LocalMessage[];
/**
 * Overlay a resident tail onto a disk *suffix* (not the full transcript).
 * Older resident-only ids belong before this suffix and must not be appended
 * (that would disorder the page). Trailing unpersisted messages — the
 * in-flight assistant that streams with `transcript: "skip"` — still trail.
 * Overlapping ids take the resident snapshot.
 */
export declare function overlayResidentLocalMessageSuffix(diskSuffix: readonly LocalMessage[], residentTail: readonly LocalMessage[], isPersisted: (messageId: string) => boolean): LocalMessage[];
export {};
//# sourceMappingURL=local-transcript.d.ts.map