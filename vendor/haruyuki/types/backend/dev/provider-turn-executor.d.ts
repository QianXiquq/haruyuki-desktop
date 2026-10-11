import type { Usage } from "@earendil-works/pi-ai";
import type { Stream } from "@letta-ai/letta-client/core/streaming";
import type { LettaStreamingResponse } from "@letta-ai/letta-client/resources/agents/messages";
import type { LocalMessage } from "../local/local-message";
import type { LocalAgentRecord, StoredMessage } from "../local/local-store";
import { type ProviderStreamPart } from "../local/local-stream-chunks";
import type { HeadlessTurnBody, HeadlessTurnExecutor, HeadlessTurnExecutorInput } from "./headless-turn-executor";
export interface ProviderTurnInput {
    conversationId: string;
    agentId: string;
    agent: LocalAgentRecord;
    systemPrompt?: string;
    body: HeadlessTurnBody;
    history: StoredMessage[];
    uiMessages: LocalMessage[];
    clientTools: unknown[];
    clientSkills: unknown[];
}
/** Provider-request start info emitted at the model-call boundary. */
export interface LlmStartInfo {
    agentId: string;
    conversationId: string;
    model: string;
    messageCount: number;
    contextWindow: number;
}
export interface LlmEndErrorInfo {
    message: string;
    detail: string;
    errorType: "llm_error" | "local_backend_error";
    retryable: boolean;
}
/** Provider-request completion info emitted once a final message is produced. */
export interface LlmEndInfo {
    agentId: string;
    conversationId: string;
    model: string;
    stopReason: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    } | null;
    durationMs: number;
    error?: LlmEndErrorInfo;
}
export type ProviderStreamEvent = {
    type: "provider-part";
    part: ProviderStreamPart;
} | {
    type: "local-message";
    message: LocalMessage;
} | {
    type: "letta-chunk";
    chunk: LettaStreamingResponse;
} | {
    type: "error";
    error: unknown;
};
export declare function providerStreamPart(part: ProviderStreamPart): ProviderStreamEvent;
export declare function providerLocalMessage(message: LocalMessage): ProviderStreamEvent;
export declare function providerLettaChunk(chunk: LettaStreamingResponse): ProviderStreamEvent;
export interface ProviderStreamAdapter {
    stream(input: ProviderTurnInput): AsyncIterable<ProviderStreamEvent> | Promise<AsyncIterable<ProviderStreamEvent>>;
}
export declare function buildProviderTurnInput(input: HeadlessTurnExecutorInput): ProviderTurnInput;
export declare function contextTokensFromUsage(usage: Usage): number | undefined;
export declare function estimateProviderContextTokens(input: ProviderTurnInput): number | undefined;
/**
 * Tokens the request cannot shed: the compiled system prompt plus the tool
 * definitions. Compaction rewrites message history, so when this floor alone
 * exceeds the serving context window there is no recovery — every turn would be
 * truncated by the engine before the model ever sees the memory the system
 * prompt carries. Callers use this to fail loudly instead.
 */
export declare function estimateProviderPromptFloorTokens(input: ProviderTurnInput): number;
/**
 * The boundary past which a provider request has no room for its completion.
 *
 * pi-ai first makes an oversized request valid by shrinking its output
 * allowance to `contextWindow - estimatedContext - 4096`, floored at one
 * token. A near-full request can therefore finish with `length` instead of
 * throwing the overflow that would otherwise be reported. Keep the same
 * 16,384-token reserve as Pi's coding-agent harness, capped at 20% for small
 * local windows. This is deliberately based on context usage, not the
 * configured output limit: an intentionally small `max_tokens` value remains a
 * normal provider length stop (the policy preserved by #3355).
 *
 * Upstream references, pinned when #3508 was fixed:
 * - pi-ai clamp: https://github.com/earendil-works/pi/blob/cee5ff7520d8828bed9955ef00419e995d1f91e0/packages/ai/src/api/simple-options.ts#L12-L19
 * - Pi reserve: https://github.com/earendil-works/pi/blob/cee5ff7520d8828bed9955ef00419e995d1f91e0/packages/coding-agent/src/core/compaction/compaction.ts#L128-L137
 * - Pi threshold: https://github.com/earendil-works/pi/blob/cee5ff7520d8828bed9955ef00419e995d1f91e0/packages/coding-agent/src/core/compaction/compaction.ts#L235-L238
 */
export declare function contextCompactionThreshold(contextWindow: number | undefined): number | undefined;
/** Advisory share of the window above which a trim is worth offering. */
export declare const DEFAULT_CONTEXT_SOFT_PRESSURE_RATIO = 0.7;
export type ContextPressureLevel = "ok" | "soft" | "hard";
/**
 * Classify how much of the serving context window a request already occupies.
 *
 * `soft` is advisory only: the CLI uses it to offer a trim before submitting a
 * turn. `hard` is the boundary the local backend refuses to cross without an
 * explicit user trim, because past it the engine either truncates the prompt
 * silently or clamps the completion to a useless one-token `length` stop.
 *
 * `hard` wins whenever both tiers match. A `softRatio` of 1 disables the soft
 * tier, since `hard` is always the lower boundary.
 */
export declare function contextPressureLevel(input: {
    contextTokens: number | undefined;
    contextWindow: number | undefined;
    softRatio?: number;
    hardThreshold?: number;
}): ContextPressureLevel;
export declare function estimateProviderRequestBytes(input: ProviderTurnInput): number | undefined;
export declare class ProviderTurnExecutor implements HeadlessTurnExecutor {
    private readonly adapter;
    constructor(adapter?: ProviderStreamAdapter);
    execute(input: HeadlessTurnExecutorInput): Promise<Stream<LettaStreamingResponse>>;
}
//# sourceMappingURL=provider-turn-executor.d.ts.map