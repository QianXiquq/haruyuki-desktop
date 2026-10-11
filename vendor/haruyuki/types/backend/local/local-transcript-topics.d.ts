import { type LocalTranscriptTopicEntry } from "./local-transcript";
/**
 * Read every topic marker in a transcript, oldest first. Unparseable lines and
 * rows that do not satisfy the marker shape are skipped: a marker is metadata,
 * so a damaged one must never block loading a conversation.
 */
export declare function readLocalTranscriptTopicEntries(messagesPath: string, options?: {
    chunkBytes?: number;
}): LocalTranscriptTopicEntry[];
//# sourceMappingURL=local-transcript-topics.d.ts.map