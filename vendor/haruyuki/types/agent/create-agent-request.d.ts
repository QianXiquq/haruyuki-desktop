/**
 * Pure builder for the `POST /v1/agents` wire payload of a Haruyuki agent.
 *
 * This is the shared creation-policy choke point for the CLI and external
 * harness surfaces. It owns the defaults that must not drift between callers:
 * agent type, prompt mode, tags, server tools, initial messages, parallel tool
 * calls, and compaction. Callers may supply either a Haruyuki personality or
 * their own identity blocks without rebuilding that policy.
 *
 * Everything reachable from this module must stay free of Node/backend imports
 * so it can be bundled in the browser-safe `agent-presets` package export.
 */
import type { CreateBlock } from "@letta-ai/letta-client/resources/blocks/blocks";
import { type PersonalityId } from "./personality-presets";
import { type MemoryPromptMode } from "./prompt-assets";
/** Agent type used for all Haruyuki agents. */
export declare const HARUYUKI_CODE_AGENT_TYPE = "letta_v1_agent";
/**
 * Server-side tools attached to created agents. Client-side tools (Read,
 * Write, Bash, etc.) are passed via client_tools at runtime instead.
 */
export declare const DEFAULT_CREATED_AGENT_BASE_TOOLS: string[];
export type CreateAgentMemoryBlock = CreateBlock;
/**
 * Root marker that makes the hosted memory repository use MemFS v2.
 * The server seeds the root `MEMORY.md` layout only when the create request
 * includes a block with this label.
 */
export declare const DEFAULT_ROOT_MEMORY_BLOCK: CreateAgentMemoryBlock;
export interface BuildCreateAgentRequestOptions {
    personalityId?: PersonalityId;
    name?: string;
    description?: string;
    /** Model ID or handle. Personality default, then catalog default, applies. */
    model?: string;
    /** Complete prompt override. Null delegates default selection to the server. */
    system?: string | null;
    /** Whether the target is Letta Cloud; callers determine this with their backend's cloud detection. */
    isLettaCloud?: boolean;
    memoryPromptMode?: MemoryPromptMode;
    /**
     * Caller-defined identity. With a personality, matching labels replace its
     * blocks and new labels append after the personality blocks.
     */
    memoryBlocks?: CreateAgentMemoryBlock[];
    blockIds?: string[];
    /** Extra tags appended after canonical Haruyuki and personality tags. */
    extraTags?: string[];
    enableMemfs?: boolean;
    isSubagent?: boolean;
    /** Exact server-side tools. Omission uses the Haruyuki web-tool defaults. */
    baseTools?: string[];
    embedding?: string;
    hidden?: boolean;
    parallelToolCalls?: boolean;
    compactionModel?: string;
}
export interface CreateAgentRequest {
    agent_type: typeof HARUYUKI_CODE_AGENT_TYPE;
    name?: string;
    description?: string;
    model: string;
    system: string | null;
    memory_blocks?: CreateAgentMemoryBlock[];
    block_ids?: string[];
    tags: string[];
    tools: string[];
    include_base_tools: false;
    include_base_tool_rules: false;
    initial_message_sequence: never[];
    parallel_tool_calls: boolean;
    compaction_settings: {
        model?: string;
    };
    embedding?: string;
    hidden?: boolean;
}
export type CreateAgentRequestForPersonality = CreateAgentRequest & {
    name: string;
    description: string;
    memory_blocks: CreateAgentMemoryBlock[];
    profile_picture?: {
        content: string;
    };
};
/** Build the canonical Core create-agent request for a Haruyuki agent. */
export declare function buildCreateAgentRequest(options?: BuildCreateAgentRequestOptions): Promise<CreateAgentRequest>;
/** Compatibility wrapper for callers that create a personality agent. */
export declare function buildCreateAgentRequestForPersonality(params: {
    personalityId: PersonalityId;
    name?: string;
    description?: string;
    model?: string;
    extraTags?: string[];
    /** This browser-safe wrapper defaults to Cloud; pass false for a local server. */
    isLettaCloud?: boolean;
}): Promise<CreateAgentRequestForPersonality>;
//# sourceMappingURL=create-agent-request.d.ts.map