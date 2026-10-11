import type { SubagentConfig, SubagentResult } from "../../agent/subagents";
import { runCodexTurn } from "./codex-app-server";
export declare const EXTERNAL_CODING_AGENT_TYPES: readonly ["claude-code", "codex"];
export type ExternalCodingAgentType = (typeof EXTERNAL_CODING_AGENT_TYPES)[number];
export interface ExternalCodingAgentMcpOptions {
    inherit: boolean;
    servers?: string[];
}
export interface ExternalCodingAgentMcpEntry {
    name: string;
    toolCount: number | null;
}
export interface ExternalCodingAgentRunOptions {
    type: ExternalCodingAgentType;
    prompt: string;
    /**
     * The external CLI's own model selector (`claude --model <value>`), never a
     * haruyuki model handle. Haruyuki subagents have no model parameter of their own;
     * this exists because the spawned program is a different product with its own
     * model catalogue.
     */
    model?: string;
    parentAgentId: string;
    parentConversationId?: string;
    resumeSessionId?: string;
    cwd?: string;
    mcpReminder?: string;
    signal?: AbortSignal;
    onStarted?: (agentId: string) => void;
}
export interface ExternalCodingAgentCommand {
    executable: string;
    args: string[];
    stdin?: string;
}
export declare function createExternalCodingAgentConfig(type: ExternalCodingAgentType): SubagentConfig;
export interface ExternalCodingAgentProcessResult {
    exitCode: number | null;
    stdout: string;
    stderr: string;
}
export interface ExternalCodingAgentDependencies {
    runCodexTurn?: typeof runCodexTurn;
    runProcess?: (command: ExternalCodingAgentCommand, options: {
        cwd: string;
        env: NodeJS.ProcessEnv;
        signal?: AbortSignal;
    }) => Promise<ExternalCodingAgentProcessResult>;
    runPreflight?: (executable: string, args: string[], env: NodeJS.ProcessEnv, signal?: AbortSignal) => Promise<ExternalCodingAgentProcessResult>;
    env?: NodeJS.ProcessEnv;
}
export declare function isExternalCodingAgentType(value: string): value is ExternalCodingAgentType;
export declare function formatExternalCodingAgentId(type: ExternalCodingAgentType, sessionId: string): string;
export declare function parseExternalCodingAgentId(agentId: string | undefined): {
    type: ExternalCodingAgentType;
    sessionId: string;
} | null;
export declare function validateExternalCodingAgentMcpOptions(mcp: ExternalCodingAgentMcpOptions | undefined): string | null;
export declare function selectExternalCodingAgentMcpEntries(inventory: ExternalCodingAgentMcpEntry[], requestedServers?: string[]): ExternalCodingAgentMcpEntry[];
export declare function buildExternalCodingAgentMcpReminder(entries: ExternalCodingAgentMcpEntry[]): string;
/**
 * Resolve the parent agent's MCP servers into the discovery reminder passed to
 * an external coding agent. Returns undefined when inheritance is not
 * requested; throws when the inventory cannot be read.
 */
export declare function resolveExternalCodingAgentMcpReminder(parentAgentId: string, mcp: ExternalCodingAgentMcpOptions | undefined): Promise<string | undefined>;
export declare function buildExternalCodingAgentCommand(options: Pick<ExternalCodingAgentRunOptions, "type" | "prompt" | "model" | "resumeSessionId" | "cwd" | "mcpReminder">): ExternalCodingAgentCommand;
export declare function parseExternalCodingAgentOutput(type: ExternalCodingAgentType, stdout: string): {
    report: string;
    sessionId?: string;
};
export declare function runExternalCodingAgent(options: ExternalCodingAgentRunOptions, deps?: ExternalCodingAgentDependencies): Promise<SubagentResult>;
//# sourceMappingURL=external-coding-agent.d.ts.map