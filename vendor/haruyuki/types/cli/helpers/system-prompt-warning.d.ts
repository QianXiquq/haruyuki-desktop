/**
 * Startup system prompt warning
 * Uses same heuristic as context-doctor to estimate system prompt token count on startup
 */
import type { AgentState } from "@letta-ai/letta-client/resources/agents/agents";
import { estimateSystemPromptTokensFromMemoryDir, estimateSystemTokens } from "../../agent/system-prompt-size";
export { estimateSystemPromptTokensFromMemoryDir, estimateSystemTokens };
export declare function estimateActiveMemorySystemPromptTokens(memoryDir: string): number;
export interface SystemPromptDoctorState {
    estimated_tokens: number;
    should_doctor: boolean;
    updated_at_ms: number;
}
export declare function setSystemPromptDoctorState(agentId: string, estimatedTokens: number): SystemPromptDoctorState;
export declare function getSystemPromptDoctorState(agentId: string): SystemPromptDoctorState | null;
export declare function refreshSystemPromptDoctorState(agentId: string, agentState: AgentState | null | undefined): SystemPromptDoctorState | null;
/** On LC CLI startup, display a warning if the system prompt is large. */
export declare function buildStartupSystemPromptWarning(agentState: AgentState | null | undefined): string | null;
//# sourceMappingURL=system-prompt-warning.d.ts.map