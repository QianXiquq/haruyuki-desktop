export interface AttachedAgentRepository {
    id: string;
    name: string;
    permissions?: string;
}
export declare function listAttachedAgentRepositories(agentId: string): Promise<AttachedAgentRepository[]>;
//# sourceMappingURL=attached-repositories.d.ts.map