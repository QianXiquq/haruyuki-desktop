import type { ListenerRuntime } from "./types";
export interface WorktreeWatcherState {
    /** The AbortController whose signal cancels the watch loop. */
    abort: AbortController;
    /** The directory being watched (e.g. `<cwd>/.haruyuki/worktrees`). */
    watchedDir: string;
}
/**
 * Start watching `<cwd>/.haruyuki/worktrees/` for new directories.
 *
 * When a new directory appears that wasn't present at watch-start time,
 * the conversation's CWD is automatically updated to point at the new
 * worktree — unless the stream-based detection already switched it.
 *
 * Returns a `WorktreeWatcherState` handle that must be passed to
 * `stopWorktreeWatcher()` on cleanup, or `null` if the directory
 * doesn't exist (no-op).
 */
export declare function startWorktreeWatcher(params: {
    runtime: ListenerRuntime;
    agentId: string | null;
    conversationId: string;
}): WorktreeWatcherState | null;
/**
 * Stop an active worktree watcher.
 */
export declare function stopWorktreeWatcher(state: WorktreeWatcherState): void;
/**
 * Stop all active worktree watchers for a listener.
 */
export declare function stopAllWorktreeWatchers(runtime: ListenerRuntime): void;
/**
 * Convenience: stop any existing watcher for a scope, then start a new one.
 * Called after every CWD change.
 */
export declare function restartWorktreeWatcher(params: {
    runtime: ListenerRuntime;
    agentId: string | null;
    conversationId: string;
}): void;
//# sourceMappingURL=worktree-watcher.d.ts.map