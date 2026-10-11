export type FileLockOptions = {
    /** A lock file older than this is treated as abandoned and reaped. */
    staleMs?: number;
    /** Poll interval while waiting for a held lock. */
    retryMs?: number;
    /** Give up acquiring the lock after this many ms; 0 tries once, Infinity waits. */
    timeoutMs?: number;
    /** Stop waiting when aborted. */
    signal?: AbortSignal;
    /**
     * Reap a lock only when the process that wrote it is gone, never merely
     * because it is old. A paused or slow holder then keeps the lock and
     * waiters time out, which is the safe outcome for a critical section that
     * must stay exclusive; age-based reaping can let two holders in.
     */
    reapOnlyDeadOwner?: boolean;
};
/**
 * Cross-process critical section guarded by an O_EXCL lock file. The lock
 * file path is created by the caller (its parent directory must already
 * exist). Stale locks (older than `staleMs`) are reaped automatically so a
 * crashed holder cannot block the system indefinitely.
 */
export declare function withFileLock<T>(lockPath: string, fn: () => Promise<T>, options?: FileLockOptions): Promise<T>;
/**
 * Acquire the lock and return its release, or null once `timeoutMs` elapses.
 * The record is written in full to a private file and published with a hard
 * link, so a lock file is never seen half-written and a process paused
 * across a reap cannot overwrite a lock someone else has since taken.
 * Release removes the file only while it still holds this acquisition.
 */
export declare function tryAcquireFileLock(lockPath: string, options?: FileLockOptions): Promise<(() => Promise<void>) | null>;
//# sourceMappingURL=file-lock.d.ts.map