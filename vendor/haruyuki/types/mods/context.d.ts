import type { ModContext } from "./types";
interface AgentContextSource {
    id?: string | null;
    name?: string | null;
    model?: string | null;
    llm_config?: {
        model?: string | null;
        model_endpoint_type?: string | null;
        reasoning_effort?: string | null;
    } | null;
}
export declare function buildModInvocationContext(options?: {
    agent?: AgentContextSource | null;
    base?: ModContext | null;
    conversationId?: string | null;
    modelIdentifier?: string | null;
    permissionMode?: string | null;
    toolset?: string | null;
    workingDirectory?: string | null;
}): ModContext;
export {};
//# sourceMappingURL=context.d.ts.map