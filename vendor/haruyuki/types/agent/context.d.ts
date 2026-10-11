/**
 * Agent context module - provides global access to current agent state
 * This allows tools to access the current agent ID without threading it through params.
 */
import type { SkillSource } from "./skills";
/**
 * Set the current agent context
 * @param agentId - The agent ID
 * @param skillsDirectory - Optional skills directory path
 * @param skillSources - Enabled skill sources for this session
 * @param agentName - Optional display name for shell/process identity
 */
export declare function setAgentContext(agentId: string, skillsDirectory?: string, skillSources?: SkillSource[], agentName?: string | null): void;
/**
 * Set the current agent ID in context (simplified version for compatibility)
 */
export declare function setCurrentAgentId(agentId: string | null): void;
/**
 * Set the current agent name in context when it is available.
 */
export declare function setCurrentAgentName(agentName: string | null): void;
/**
 * Get the current agent ID
 * @throws Error if no agent context is set
 */
export declare function getCurrentAgentId(): string;
/**
 * Get the current agent name if runtime context has it.
 */
export declare function getCurrentAgentName(): string | null;
/**
 * Get the skills directory path
 * @returns The skills directory path or null if not set
 */
export declare function getSkillsDirectory(): string | null;
/**
 * Get enabled skill sources for discovery/injection.
 */
export declare function getSkillSources(): SkillSource[];
/**
 * Set the current conversation ID
 * @param conversationId - The conversation ID, or null to clear
 */
export declare function setConversationId(conversationId: string | null): void;
/**
 * Get the current conversation ID
 * @returns The conversation ID or null if not set
 */
export declare function getConversationId(): string | null;
//# sourceMappingURL=context.d.ts.map