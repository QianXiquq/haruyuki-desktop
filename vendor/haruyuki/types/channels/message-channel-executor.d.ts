import type { ExternalToolCallResult } from "../types/app-server-protocol";
import type { MessageChannelBindingOperations } from "./message-channel-bindings";
import { type MessageChannelIdempotencyScope } from "./message-channel-idempotency";
import type { MessageChannelInput } from "./message-channel-types";
import type { ChannelMessageActionAdapter, ChannelMessageActionRoute, ChannelMessageActionTransport, ChannelResolvedMessageTarget } from "./plugin-types";
import type { ChannelTurnSource, SupportedChannelId } from "./types";
export interface MessageChannelExecutionScope {
    agentId: string;
    conversationId: string;
}
export interface ResolvedMessageChannelContext {
    route: ChannelMessageActionRoute;
    transport: ChannelMessageActionTransport;
    messageActions: ChannelMessageActionAdapter;
}
export interface ResolvedProactiveMessageChannelContext {
    accountId: string;
    target: ChannelResolvedMessageTarget;
    transport: ChannelMessageActionTransport;
    messageActions: ChannelMessageActionAdapter;
}
export interface MessageChannelExecutionResolver {
    isSupportedChannel(channel: string): boolean;
    resolveRoutedContext(params: {
        channel: SupportedChannelId;
        chatId: string;
        accountId?: string;
        threadId?: string | null;
        scope: MessageChannelExecutionScope;
    }): Promise<ResolvedMessageChannelContext | string | null> | ResolvedMessageChannelContext | string | null;
    resolveProactiveContext?(params: {
        channel: SupportedChannelId;
        target: string;
        accountId?: string;
        scope: MessageChannelExecutionScope;
    }): Promise<ResolvedProactiveMessageChannelContext | string> | ResolvedProactiveMessageChannelContext | string;
}
export interface ExecuteMessageChannelOptions {
    scope: MessageChannelExecutionScope;
    resolver: MessageChannelExecutionResolver;
    channelTurnSources?: ChannelTurnSource[];
    idempotencyScope?: MessageChannelIdempotencyScope | null;
    idempotencyMode?: "explicit" | "relay";
    /** Available only when this host implements persisted binding operations. */
    bindings?: MessageChannelBindingOperations;
}
export declare function createMessageChannelExternalToolResult(text: string): ExternalToolCallResult;
/**
 * Execute the canonical MessageChannel contract against host-owned routing and
 * transport adapters. This owns normalization, scope checks, thread/account
 * inference, action discovery, and outbound formatting without requiring the
 * local channel registry or local credentials.
 */
export declare function executeMessageChannel(input: MessageChannelInput | Record<string, unknown>, options: ExecuteMessageChannelOptions): Promise<string>;
/** Execute MessageChannel and return the canonical external-tool result. */
export declare function executeMessageChannelExternalTool(input: MessageChannelInput | Record<string, unknown>, options: ExecuteMessageChannelOptions): Promise<ExternalToolCallResult>;
//# sourceMappingURL=message-channel-executor.d.ts.map