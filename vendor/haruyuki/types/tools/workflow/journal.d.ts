import type { SubagentOutcome } from "./types.ts";
export type JournalEntry = {
    kind: "agent_started";
    callIndex: number;
    conversationId: string;
} | {
    callIndex: number;
    label: string;
    prompt: string;
    /** Present on a continuation attempt; outcome carries the same worker ID. */
    resumedConversationId?: string;
    outcome: SubagentOutcome;
} | {
    kind: "decision";
    model: string;
    cost?: number;
    calibrated: boolean;
    valid: boolean;
    totalTokens: number;
};
export declare function defaultExecutionsDir(): string;
export declare function newExecutionId(): string;
export declare function createExecutionDir(executionsDir: string, executionId: string, script: string, args: unknown): {
    executionDir: string;
    scriptPath: string;
    journalPath: string;
};
export declare function appendJournalEntry(journalPath: string, entry: JournalEntry): void;
//# sourceMappingURL=journal.d.ts.map