import type { McpServerConfig } from "./mcp-client";
import type { ToolsetPreference } from "./tools/toolset-types";
import type { ClientPreferences } from "./types/client-preferences";
/** Per-agent settings; baseUrl is omitted for the Letta API. */
export interface AgentSettings {
    clientPreferencesByConversation?: Record<string, ClientPreferences>;
    agentId: string;
    baseUrl?: string;
    pinned?: boolean;
    memfs?: boolean;
    toolset?: ToolsetPreference;
    toolsetsByConversation?: Record<string, Exclude<ToolsetPreference, "auto">>;
    systemPromptPreset?: string;
    systemPromptHash?: string;
    systemPromptVersion?: string;
    mcpServers?: McpServerConfig[];
}
export declare function stripEmptyAgentSettings(settings: AgentSettings): AgentSettings;
export declare function readToolsetPreference(settings: AgentSettings | undefined, conversationId: string): ToolsetPreference;
export declare function toolsetPreferenceUpdate(settings: AgentSettings | undefined, preference: ToolsetPreference, conversationId: string): Partial<AgentSettings> | null;
export declare function readClientPreferences(settings: AgentSettings | undefined, conversationId: string): ClientPreferences;
export declare function clientPreferencesUpdate(settings: AgentSettings | undefined, preferences: ClientPreferences, conversationId: string): Partial<AgentSettings> | null;
//# sourceMappingURL=agent-settings.d.ts.map