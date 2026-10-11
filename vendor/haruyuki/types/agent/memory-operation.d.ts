/** Lock a checkout and its index; isolated reflection worktrees remain independent. */
export declare function getMemoryOperationPath(memoryDir: string): Promise<string>;
/**
 * Serialize the harness-owned writers of a memory checkout across local
 * processes: memory workers, conflict repair, reflection integration, and
 * post-turn sync. The primary agent's own edits are not routed through this
 * lock; the prompts ask it to wait for a worker it launched, and workers stage
 * only the files they change so concurrent edits degrade to a Git conflict.
 *
 * Returns a release function, or null when the checkout is owned by another
 * running process and `wait` is false.
 */
export declare function claimMemoryOperation(memoryDir: string, options?: {
    wait?: boolean;
    signal?: AbortSignal;
}): Promise<(() => Promise<void>) | null>;
export declare function withMemoryOperation<T>(memoryDir: string, operation: () => Promise<T>, signal?: AbortSignal): Promise<T>;
//# sourceMappingURL=memory-operation.d.ts.map