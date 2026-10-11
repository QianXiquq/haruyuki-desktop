/** Signal 0 checks existence without delivering anything; EPERM means alive but not ours. */
export declare function isProcessAlive(pid: number): boolean;
/**
 * Start time of a process as the OS reports it, or null when it cannot be
 * read. Rendered in UTC with the C locale so every process on the machine
 * produces the same string for the same pid regardless of its own TZ.
 */
export declare function getProcessStartTime(pid: number): Promise<string | null>;
/** This process's own start time, resolved once; it cannot change. */
export declare function getOwnProcessStartTime(): Promise<string | null>;
export interface ProcessIdentity {
    pid: number;
    /** Start time from getProcessStartTime, so a reused pid is not mistaken for the original. */
    started?: string;
}
/**
 * Is the recorded process still the one running under that pid? Liveness
 * alone is not enough because pids are recycled; a recorded start time settles
 * it. Without one, or when the OS cannot report it, liveness decides.
 */
export declare function isSameProcessRunning(identity: ProcessIdentity): Promise<boolean>;
//# sourceMappingURL=process-liveness.d.ts.map