export interface MemoryConstraintsValidationResult {
    valid: boolean;
    output: string;
}
export interface InvalidPendingMemory {
    status: "invalid";
    summary: string;
    memoryDir: string;
    localOnly: boolean;
}
/** Validate the committed MemFS tree without changing its index or working tree. */
export declare function validateMemoryConstraintsHead(memoryDir: string): MemoryConstraintsValidationResult;
/**
 * Validate the tree post-turn sync would publish. Hosted MemFS validates only
 * the pushed tip, and the runtime loads only the head of main, so intermediate
 * commits are not checked.
 */
export declare function invalidPendingMemory(memoryDir: string, localOnly: boolean): InvalidPendingMemory | null;
//# sourceMappingURL=memory-constraints-audit.d.ts.map