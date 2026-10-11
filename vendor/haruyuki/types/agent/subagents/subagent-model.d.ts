export declare function getModelHandleFromAgent(agent: {
    model?: string | null;
    model_settings?: {
        provider_type?: unknown;
    } | null;
    llm_config?: {
        model_endpoint_type?: string | null;
        model?: string | null;
    };
}): string | null;
/**
 * The model handle the parent conversation is running: the conversation-scoped
 * override when there is one, otherwise the agent's own model. A subagent
 * inherits this value verbatim.
 */
export declare function getPrimaryAgentModelHandle(scope?: {
    agentId?: string | null;
    conversationId?: string | null;
}): Promise<{
    handle: string | null;
    agent: {
        model?: string | null;
        name?: string | null;
        model_settings?: {
            provider_type?: unknown;
        } | null;
        llm_config?: {
            model_endpoint_type?: string | null;
            model?: string | null;
        };
    } | null;
}>;
//# sourceMappingURL=subagent-model.d.ts.map