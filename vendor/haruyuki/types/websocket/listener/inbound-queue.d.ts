import type { ConversationRuntime, IncomingMessage } from "./types";
export declare function getInboundClientMessageId(incoming: IncomingMessage): string | undefined;
export declare function getInboundClientMessageIds(incoming: IncomingMessage): string[];
export declare function enqueueInboundUserMessage(runtime: ConversationRuntime, incoming: IncomingMessage): boolean;
//# sourceMappingURL=inbound-queue.d.ts.map