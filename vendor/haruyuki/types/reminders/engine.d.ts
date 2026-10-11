import type { MessageCreate } from "@letta-ai/letta-client/resources/agents/agents";
import type { SkillSource } from "../agent/skills";
import { type SessionContextSource } from "../cli/helpers/session-context";
import type { ShellContext } from "../utils/shell-context";
import { type SharedReminderId, type SharedReminderMode } from "./catalog";
import type { SessionContextReason, SharedReminderState } from "./state";
export interface AgentReminderContext {
    id: string;
    name: string | null;
    description?: string | null;
    lastRunAt?: string | null;
    conversationId?: string;
}
export interface SharedReminderContext {
    mode: SharedReminderMode;
    agent: AgentReminderContext;
    state: SharedReminderState;
    systemInfoReminderEnabled: boolean;
    skillSources: SkillSource[];
    conversationBootstrapContent?: MessageCreate["content"];
    /** Explicit working directory (overrides process.cwd() in session context). */
    workingDirectory?: string;
    /** Source of the session context (varies intro text). */
    sessionContextSource?: SessionContextSource;
    /** Reason the session context is being (re)generated. */
    sessionContextReason?: SessionContextReason;
    /** Shell context detected at startup, if available. */
    shellContext?: ShellContext;
}
export type ReminderTextPart = {
    type: "text";
    text: string;
};
export interface SharedReminderBuildResult {
    parts: ReminderTextPart[];
    appliedReminderIds: SharedReminderId[];
}
type SharedReminderProvider = (context: SharedReminderContext) => Promise<string | null>;
export interface McpServerReminderEntry {
    name: string;
    /** Tool count when cheaply known (cloud-synced tools); null otherwise. */
    toolCount: number | null;
}
export interface McpServersReminderDependencies {
    getLocalServerNames?: (agentId: string) => string[];
    /** Returns cloud-connected servers, or null when unavailable. */
    listServerSideServers?: (agentId: string) => Promise<McpServerReminderEntry[] | null>;
}
export declare function buildMcpServersReminderText(entries: McpServerReminderEntry[]): string;
export declare function listMcpServersForAgent(agentId: string, _state: SharedReminderContext["state"], deps?: McpServersReminderDependencies): Promise<McpServerReminderEntry[]>;
export declare function buildMcpServersInfoReminderText(context: Pick<SharedReminderContext, "agent" | "state">, deps?: McpServersReminderDependencies): Promise<string | null>;
export declare const sharedReminderProviders: Record<SharedReminderId, SharedReminderProvider>;
export declare function assertSharedReminderCoverage(): void;
export declare function buildSharedReminderParts(context: SharedReminderContext): Promise<SharedReminderBuildResult>;
export declare function prependReminderPartsToContent(content: MessageCreate["content"], reminderParts: ReminderTextPart[]): MessageCreate["content"];
export {};
//# sourceMappingURL=engine.d.ts.map