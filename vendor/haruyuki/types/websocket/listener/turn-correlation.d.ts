import type { ConversationRuntime, IncomingMessage, ListenerRuntime } from "./types";
export interface TurnCorrelation {
    readonly clientMessageIds: string[];
    appendDequeuedBatch: (batchId: string) => void;
    observeRun: (runId: string) => void;
}
export declare function buildTurnCorrelationSnapshot(listener: ListenerRuntime, agentId: string | null, conversationId: string | null): {
    client_message_ids_by_run_id?: Record<string, string[]>;
};
export declare function createTurnCorrelation(runtime: ConversationRuntime, message: IncomingMessage, batchId: string): TurnCorrelation;
//# sourceMappingURL=turn-correlation.d.ts.map