export declare const APP_SERVER_PROTOCOL_VERSION = 1;
export interface AppServerInfoCommand {
    type: "app_server_info";
    /** Echoed back in the response for request correlation. */
    request_id: string;
}
export interface AppServerInfoResponseMessage {
    type: "app_server_info_response";
    request_id: string;
    /** Synchronous post-auth capability discovery has no domain failure variant. */
    success: true;
    backend: "local" | "api";
    letta_code_version: string;
    /** Wire value reported by the server; clients compare it with their supported version. */
    protocol_version: number;
    capabilities: {
        agent_management: boolean;
        conversation_management: boolean;
        memory_management: boolean;
        runtime_start: boolean;
        /** Agent-free conversation creation/resume, including the local backend. */
        agent_free_conversations?: boolean;
        launch_subagent?: boolean;
        runtime_workspace_sandbox?: boolean;
        runtime_external_tools_update?: boolean;
        structured_outputs?: boolean;
        split_channels: boolean;
    };
}
export declare function isAppServerInfoResponseMessage(message: unknown): message is AppServerInfoResponseMessage;
//# sourceMappingURL=app-server-info.d.ts.map