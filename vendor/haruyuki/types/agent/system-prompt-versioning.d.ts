import type { AgentState } from "@letta-ai/letta-client/resources/agents";
import { type MemoryPromptMode } from "./prompt-assets";
export declare const CLOUD_MANAGED_PROMPT_PRESET = "cloud-managed";
/**
 * Whether the active backend serves a Cloud-managed system prompt.
 *
 * This used to be `remoteMemfs && !localMemfs` — the Cloud-only `environment
 * routing` capability was the third conjunct before it was deleted. No backend
 * left in the product serves server-side memory, and the local in-process
 * backend is the only one, so the answer is now a constant. The function stays
 * so the call site keeps its shape.
 */
export declare function isCloudPromptBackend(): boolean;
type ManagedPrompt = {
    preset: string;
    hash: string;
    version: string;
};
type SystemPromptUpdateDecision = {
    kind: "noop";
    reason: string;
} | {
    kind: "track";
    prompt: ManagedPrompt;
} | {
    kind: "custom";
    reason: string;
} | {
    kind: "clear";
    reason: string;
} | {
    kind: "inherit";
    nextSystemPrompt: null;
    reason: string;
} | {
    kind: "update";
    nextSystemPrompt: string;
    prompt: ManagedPrompt;
    reason: string;
};
export interface ManagedSystemPromptUpdateOptions {
    agent: AgentState;
    memoryMode: MemoryPromptMode;
    onUpdated?: (agent: AgentState) => void;
}
export declare function hashSystemPrompt(content: string): string;
export declare function recordManagedSystemPrompt(agentId: string, preset: string, memoryMode: MemoryPromptMode, content?: string): void;
export declare function resolveMemoryPromptMode(input: {
    localMemfs: boolean;
    memoryDir: string | null;
    memfsEnabled: boolean;
}): MemoryPromptMode;
export declare function getMemoryPromptModeForAgent(agentId: string): MemoryPromptMode;
export declare function decideManagedSystemPromptUpdate(input: {
    agent: AgentState;
    memoryMode: MemoryPromptMode;
    isLettaCloud?: boolean;
    preserveCloudSystemPrompt?: boolean;
    storedPreset?: string;
    storedHash?: string;
    storedVersion?: string;
}): SystemPromptUpdateDecision;
export declare function ensureHaruyukiOriginTag(agent: AgentState): Promise<AgentState>;
export declare function scheduleManagedSystemPromptUpdate({ agent, memoryMode, onUpdated, }: ManagedSystemPromptUpdateOptions): void;
export {};
//# sourceMappingURL=system-prompt-versioning.d.ts.map