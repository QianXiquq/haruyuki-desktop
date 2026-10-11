import type { AgentState } from "@letta-ai/letta-client/resources/agents/agents";
import type { AgentCreateBody } from "../backend";
import type { LocalAgentRecord } from "./local-types";
export declare function isHiddenLocalAgentRecord(record: {
    hidden?: boolean | null;
    tags?: unknown;
}): boolean;
export declare function shouldPersistSubagentHiddenBackfill(raw: unknown, record: LocalAgentRecord): boolean;
export declare function createDefaultAgentRecord(agentId: string, defaultAgentName: string, defaultAgentModel: string): LocalAgentRecord;
export declare function createLocalAgentRecord(body: AgentCreateBody, defaultAgentName: string, defaultAgentModel: string): LocalAgentRecord;
export declare function shouldUseDefaultLocalModel(model: unknown): boolean;
export declare function normalizeAgentRecord(value: unknown, defaultAgentModel: string): LocalAgentRecord | undefined;
export declare function projectLocalAgentState(record: LocalAgentRecord, messageIds?: string[], inContextMessageIds?: string[], lastRunCompletion?: string | null): AgentState;
//# sourceMappingURL=local-agent-record.d.ts.map