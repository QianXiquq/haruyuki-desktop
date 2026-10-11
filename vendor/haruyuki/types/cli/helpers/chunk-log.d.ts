/**
 * ChunkLog - Rolling log of the last N streaming chunks received by the client.
 *
 * Stores truncated chunks as JSONL on disk, organized per agent per session:
 *   ~/.haruyuki/logs/chunk-logs/{agent_id}/{session_id}.jsonl
 *
 * Metadata (message_type, ids, timestamps) is preserved fully;
 * large content fields (reasoning, tool_return, arguments, etc.) are
 * truncated to keep the file compact.
 *
 * Old session logs are garbage-collected: only the most recent N sessions
 * per agent are kept on disk.
 */
import type { LettaStreamingResponse } from "@letta-ai/letta-client/resources/agents/messages";
declare class ChunkLog {
    private buffer;
    private dirty;
    private logPath;
    private agentDir;
    private dirCreated;
    /**
     * Initialize the chunk log for a specific agent + session.
     * Must be called before append/flush will write to disk.
     * Clears in-memory buffer and garbage-collects old session files.
     */
    init(agentId: string, sessionId: string): void;
    /**
     * Append a chunk to the in-memory log. Does NOT write to disk.
     * Call flush() after a stream completes to persist.
     */
    append(chunk: LettaStreamingResponse): void;
    /**
     * Flush buffered entries to disk. Call once per stream drain, not per chunk.
     */
    flush(): void;
    /**
     * Get all entries as an array of objects (for sending in feedback payload).
     */
    getEntries(): Record<string, unknown>[];
    /**
     * Number of entries currently in the log.
     */
    get size(): number;
    private ensureDir;
    private writeToDisk;
    /**
     * Remove old session log files, keeping only the most recent N.
     *
     * Session filenames start with Date.now() (e.g. "1740000000000-abc123.jsonl"),
     * so lexicographic sort orders them chronologically.
     */
    private pruneOldSessions;
}
export declare const chunkLog: ChunkLog;
export {};
//# sourceMappingURL=chunk-log.d.ts.map