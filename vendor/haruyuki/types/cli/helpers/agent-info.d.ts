export interface AgentInfo {
    id: string;
    name: string | null;
    description?: string | null;
    lastRunAt?: string | null;
}
export interface AgentInfoOptions {
    agentInfo: AgentInfo;
    conversationId?: string;
}
/**
 * Build the agent info system reminder.
 * Contains agent identity information (ID, name, description, memory dir).
 * Returns empty string on any failure (graceful degradation).
 */
export declare function buildAgentInfo(options: AgentInfoOptions): string;
//# sourceMappingURL=agent-info.d.ts.map