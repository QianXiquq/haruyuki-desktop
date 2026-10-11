/**
 * Application-wide constants
 */
/**
 * Default model handle for lightweight conversation title generation.
 */
export declare const DEFAULT_TITLE_SUMMARIZATION_MODEL = "openai/gpt-6-luna";
/**
 * Default agent name when creating a new agent
 */
export declare const DEFAULT_AGENT_NAME = "Haruyuki";
/**
 * Published executable name (`package.json#bin`). Fallback command for
 * subsystems that cannot re-invoke the running entry script directly (bundled
 * hosts): the subagent launcher, the channel gateway supervisor, the `mods`
 * runner. A stale value spawns a command that does not exist.
 */
export declare const APP_BINARY_NAME = "haruyuki";
/**
 * Message displayed when user interrupts tool execution
 */
export declare const INTERRUPTED_BY_USER = "Interrupted by user";
/**
 * Synthetic tool result injected when a turn ended without completing all tool calls
 * (e.g. process crash or unhandled stream error). Settled automatically at the start
 * of the next turn so the conversation history stays valid for the provider.
 */
export declare const TURN_DID_NOT_COMPLETE = "Turn did not complete";
/**
 * XML tag used to wrap system reminder content injected into messages
 */
export declare const SYSTEM_REMINDER_TAG = "system-reminder";
export declare const SYSTEM_REMINDER_OPEN = "<system-reminder>";
export declare const SYSTEM_REMINDER_CLOSE = "</system-reminder>";
export declare const SYSTEM_ALERT_TAG = "system-alert";
export declare const SYSTEM_ALERT_OPEN = "<system-alert>";
export declare const SYSTEM_ALERT_CLOSE = "</system-alert>";
/**
 * How often (in turns) to check for memfs sync conflicts, even without
 * filesystem change events. Catches block-only changes (e.g. ADE/API edits).
 */
export declare const MEMFS_CONFLICT_CHECK_INTERVAL = 5;
/**
 * Header displayed before compaction summary when conversation context is truncated
 */
export declare const COMPACTION_SUMMARY_HEADER = "(Earlier messages in this conversation have been compacted to free up context, summarized below)";
/**
 * Status bar thresholds - only show indicators when values exceed these
 */
export declare const TOKEN_DISPLAY_THRESHOLD = 100;
export declare const ELAPSED_DISPLAY_THRESHOLD_MS: number;
//# sourceMappingURL=constants.d.ts.map