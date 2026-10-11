import type { MessageCreate } from "@letta-ai/letta-client/resources/agents/agents";
import { type QueuedMessage } from "../utils/message-queue-bridge";
import { type NotificationScope } from "../utils/task-notifications";
export declare const DEFAULT_EXTERNAL_TOOL_YIELD_MS = 10000;
type ExternalResult = {
    status: "success" | "error";
    toolReturn: MessageCreate["content"];
};
/** Yield an external result as a scoped notification without starting a second request. */
export declare function autoBackgroundExternalTool<T extends ExternalResult>(toolName: string, tool: {
    autoBackground?: boolean;
} | undefined, operation: Promise<T>, options?: {
    yieldMs?: number;
    scope?: NotificationScope;
    runtimeScope?: {
        agentId?: string | null;
        conversationId?: string | null;
        actingUserId?: string;
    };
    canBackground?: boolean | (() => boolean);
    enqueue?: (message: QueuedMessage) => void;
    shouldEnqueue?: () => boolean | Promise<boolean>;
}): Promise<T | {
    status: "success";
    toolReturn: string;
}>;
export {};
//# sourceMappingURL=external-tool-background.d.ts.map