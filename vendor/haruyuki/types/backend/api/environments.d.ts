import { apiRequest } from "./request";
export interface EnvironmentMetadata {
    os?: string;
    lettaCodeVersion?: string;
    nodeVersion?: string;
    environmentMessageProtocol?: string;
    workingDirectory?: string;
    gitBranch?: string;
    supported_commands?: string[];
    [key: string]: unknown;
}
export interface EnvironmentConnection {
    id: string;
    connectionId: string | null;
    deviceId: string;
    listenerInstanceId?: string;
    connectionName: string;
    organizationId: string;
    userId?: string;
    apiKeyOwner?: string;
    podId: string | null;
    connectedAt: number | null;
    lastHeartbeat: number | null;
    lastSeenAt: number;
    firstSeenAt: number;
    currentMode?: string;
    metadata?: EnvironmentMetadata;
}
export interface ListEnvironmentsResponse {
    connections: EnvironmentConnection[];
    hasNextPage: boolean;
}
export type SendEnvironmentMessageBody = Record<string, unknown> & {
    messages: Array<Record<string, unknown>>;
    agentId?: string;
    conversationId?: string | null;
};
export interface SendEnvironmentMessageResponse {
    success: boolean;
    message: string;
}
export interface CreateAgentSandboxResponse {
    sandboxId: string;
    deviceId: string;
    connectionName: string;
}
export declare function listEnvironments(options?: {
    limit?: number;
    after?: string;
    onlineOnly?: boolean;
}): Promise<ListEnvironmentsResponse>;
export declare function sendEnvironmentMessage(connectionId: string, body: SendEnvironmentMessageBody): Promise<SendEnvironmentMessageResponse>;
export declare function getEnvironmentConnection(deviceId: string): Promise<EnvironmentConnection>;
export declare function createAgentSandbox(agentId: string, options?: {
    conversationId?: string;
}, request?: typeof apiRequest): Promise<CreateAgentSandboxResponse>;
export declare function isEnvironmentOnline(environment: EnvironmentConnection): boolean;
export declare function describeEnvironment(environment: EnvironmentConnection): string;
export declare function resolveDesktopEnvironmentConnectionId(list?: typeof listEnvironments): Promise<{
    connectionId: string;
    environment: EnvironmentConnection;
}>;
export declare function resolveEnvironmentConnectionId(selector: string, list?: typeof listEnvironments): Promise<{
    connectionId: string;
    environment: EnvironmentConnection;
}>;
export declare function resolveAgentSandboxConnectionId(agentId: string, options?: {
    conversationId?: string;
    timeoutMs?: number;
    pollIntervalMs?: number;
}): Promise<{
    connectionId: string;
    environment: EnvironmentConnection;
}>;
//# sourceMappingURL=environments.d.ts.map