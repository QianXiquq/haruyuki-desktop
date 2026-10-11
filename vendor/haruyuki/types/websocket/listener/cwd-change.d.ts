import type { ListenerTransport } from "./transport";
import type { ConversationRuntime, ListenerRuntime } from "./types";
export declare function switchCurrentRuntimeWorkingDirectory(workingDirectory: string): Promise<void>;
/**
 * Updates a captured tool execution context so tool calls later in the SAME
 * turn resolve the new working directory. Turns bake their cwd into the
 * prepared execution context at turn start; without this, an in-flight turn
 * keeps running tools in the previous directory after a cwd switch.
 */
export declare function updateToolExecutionContextCwd(executionContextId: string | undefined, workingDirectory: string): Promise<void>;
export declare function switchConversationWorkingDirectory(params: {
    runtime: ListenerRuntime;
    agentId: string | null;
    conversationId: string;
    workingDirectory: string;
    emitStatus?: boolean;
    statusRuntime?: ConversationRuntime | ListenerRuntime;
    statusSocket?: ListenerTransport;
    updateCurrentRuntimeContext?: boolean;
}): Promise<void>;
//# sourceMappingURL=cwd-change.d.ts.map