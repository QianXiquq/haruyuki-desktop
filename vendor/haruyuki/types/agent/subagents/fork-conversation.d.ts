import type { Backend } from "../../backend";
import type { SubagentConfig } from ".";
export declare function inheritForkToolset(agentId: string, parentConversationId: string, forkConversationId: string): Promise<void>;
interface ForkParentConversationParams {
    backend: Backend;
    parentAgentId: string;
    parentConversationId: string;
    config: SubagentConfig;
    signal?: AbortSignal;
}
interface ForkParentConversationDependencies {
    inheritToolset?: typeof inheritForkToolset;
}
/**
 * Fork the parent conversation, then apply fork-only runtime configuration.
 *
 * A fork inherits everything: the conversation copy carries the parent's
 * applied prefix snapshot and model, and nothing recompiles or re-pins it here.
 * Only client-side preferences that are keyed by conversation ID (the toolset)
 * are copied explicitly.
 */
export declare function forkParentConversation(params: ForkParentConversationParams, dependencies?: ForkParentConversationDependencies): Promise<{
    id: string;
}>;
export {};
//# sourceMappingURL=fork-conversation.d.ts.map