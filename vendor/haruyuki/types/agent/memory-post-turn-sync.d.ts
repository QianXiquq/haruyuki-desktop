import { type MemoryPostTurnSyncResult } from "./memory-git";
/**
 * Publish memory commits that a turn left unpushed, and refuse to publish a
 * tree that fails the memory constraints.
 *
 * Lives outside `memory-git.ts` only because that file sits at its size ratchet:
 * it may shrink, never grow.
 */
export declare function syncPendingMemoryCommitsAfterTurn(agentId: string, options?: {
    memoryDir?: string;
}): Promise<MemoryPostTurnSyncResult>;
//# sourceMappingURL=memory-post-turn-sync.d.ts.map