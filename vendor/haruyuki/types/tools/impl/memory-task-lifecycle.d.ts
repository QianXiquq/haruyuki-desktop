import { claimMemoryConflictRepair } from "../../agent/memory-conflict-repair";
import type { MemoryPostTurnSyncResult } from "../../agent/memory-git";
import { getSnapshot as getSubagentSnapshot } from "../../agent/subagent-state";
import type { SubagentMemoryScope, SubagentResult } from "../../agent/subagents";
import type { SpawnBackgroundSubagentTaskArgs } from "./task";
export interface RunBackgroundMemoryTaskParams {
    agentId: string;
    conversationId: string;
    memoryDir: string;
    assignment: string;
    /** Set for a harness-launched Git or validation repair: its attempt token. */
    repairToken?: string;
    signal: AbortSignal;
    subagentId: string;
    outputFile: string;
    /** Transcript header for a worker identity, in the task's usual format. */
    formatHeader: (identity: Pick<SubagentResult, "agentId" | "conversationId">) => string;
    /**
     * Spawn the worker with the handoff prompt, optional transcript snapshot,
     * and the memory scope of the private worktree it must edit.
     */
    execute: (assignment: string, transcriptPath: string | undefined, memoryScope: SubagentMemoryScope) => Promise<SubagentResult>;
    /** Harness repair, launched when the worker's sync leaves a repairable state. */
    repair: (result: MemoryPostTurnSyncResult) => void | Promise<unknown>;
    getSnapshot?: typeof getSubagentSnapshot;
}
/**
 * Run a fresh memory worker under its checkout lock. The worker's identity and
 * report are written to the task log as soon as they are known so the primary
 * can inspect the task even when remote sync is slow or fails afterwards.
 */
export declare function runBackgroundMemoryTask(params: RunBackgroundMemoryTaskParams): {
    execution: Promise<SubagentResult>;
    unsubscribe: () => void;
};
/**
 * Launch a repair-only worker for a conflict or invalid committed tree unless
 * one is already handling it. True while a worker is on the problem, launched
 * here or still running from an earlier turn, so post-turn sync stays silent.
 * False when a worker already attempted the same state or launch failed, so
 * the harness can report the blocked update without assigning foreground work.
 * Callers hold the checkout lease.
 */
export declare function ensureMemoryRepair(params: {
    agentId: string;
    conversationId?: string | null;
    result: MemoryPostTurnSyncResult;
}, spawn: (args: SpawnBackgroundSubagentTaskArgs) => unknown, claimRepair?: typeof claimMemoryConflictRepair): Promise<boolean>;
/** Await child teardown before the process owning its checkout lock exits. */
export declare function finishBackgroundMemoryTasks(agentId?: string, conversationId?: string, options?: {
    cancel?: boolean;
}): Promise<void>;
/**
 * Interactive exits wait briefly for running memory work, then cancel what is
 * left so the child, its snapshot and its lock are torn down before the
 * process goes. Work still in flight after the grace period is dropped.
 */
export declare function cancelBackgroundMemoryTasks(graceMs?: number): Promise<void>;
/** Controlled process exits must account for tasks from previously active conversations too. */
export declare function shutdownBackgroundMemoryTasks(exitCode: number): Promise<void>;
//# sourceMappingURL=memory-task-lifecycle.d.ts.map