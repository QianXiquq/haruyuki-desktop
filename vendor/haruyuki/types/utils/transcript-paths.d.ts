/** Env override for the reflection transcript root. */
export declare const TRANSCRIPT_ROOT_ENV = "LETTA_TRANSCRIPT_ROOT";
/**
 * Root directory for reflection transcripts: `$LETTA_TRANSCRIPT_ROOT` when set,
 * else `~/.haruyuki/transcripts`.
 *
 * Shared (rather than private to `reflection-transcript.ts`) so the filesystem
 * sandbox can carve it writable as a harness-metadata path: a memory-subagent
 * subagent persists its OWN transcript here via the headless loop, and the
 * write policy governs the agent's non-deterministic work, not harness artifacts.
 */
export declare function getTranscriptRoot(): string;
//# sourceMappingURL=transcript-paths.d.ts.map