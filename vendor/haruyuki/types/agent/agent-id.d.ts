export type AgentBackendMode = "local" | "api";
export declare function isLocalAgentId(agentId: string): boolean;
export declare function isCloudAgentId(agentId: string): boolean;
export declare function isAgentIdCompatibleWithBackend(agentId: string, backendMode: AgentBackendMode): boolean;
//# sourceMappingURL=agent-id.d.ts.map