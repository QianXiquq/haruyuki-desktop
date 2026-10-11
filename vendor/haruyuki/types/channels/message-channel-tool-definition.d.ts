import type { ExternalToolDefinitionPayload } from "../types/app-server-protocol";
import type { ChannelMessageActionAdapter, ChannelMessageToolSchemaContribution } from "./plugin-types";
import type { ChannelReplyMode, SupportedChannelId } from "./types";
export interface MessageChannelToolChannel {
    channelId: SupportedChannelId;
    displayName: string;
    accountId?: string | null;
    replyMode?: ChannelReplyMode;
    routedDestinationKey?: string;
    messageActions?: Pick<ChannelMessageActionAdapter, "describeMessageTool"> | null;
}
export interface MessageChannelToolDiscoveryResult {
    activeChannels: SupportedChannelId[];
    displayNames: string[];
    accountIds: string[];
    actions: string[];
    schemaContributions: ChannelMessageToolSchemaContribution[];
    automaticRelay?: boolean;
}
export interface BuildMessageChannelToolOptions {
    channels: readonly MessageChannelToolChannel[];
    /** Whether this tool is attached to one routed external-channel scope. */
    scoped: boolean;
    /** Advertise target-based proactive sends when the host can resolve them. */
    allowProactiveTargets?: boolean;
}
export interface ResolvedMessageChannelToolDefinition {
    description: string;
    schema: Record<string, unknown>;
}
export declare function resolveMessageChannelToolChannels(channels: readonly MessageChannelToolChannel[]): MessageChannelToolDiscoveryResult;
export declare function buildMessageChannelSchemaFromDiscovery(baseSchema: Record<string, unknown>, discovery: MessageChannelToolDiscoveryResult, allowProactiveTargets?: boolean): Record<string, unknown>;
export declare function buildMessageChannelDescriptionFromDiscovery(baseDescription: string, discovery: MessageChannelToolDiscoveryResult, scoped: boolean, allowProactiveTargets?: boolean): string;
export declare function buildMessageChannelToolFromDiscovery(params: {
    baseDescription: string;
    baseSchema: Record<string, unknown>;
    discovery: MessageChannelToolDiscoveryResult;
    scoped: boolean;
    allowProactiveTargets?: boolean;
}): ResolvedMessageChannelToolDefinition;
/** Build the exact model-facing MessageChannel tool for an external gateway. */
export declare function buildMessageChannelExternalToolDefinition(options: BuildMessageChannelToolOptions): ExternalToolDefinitionPayload;
//# sourceMappingURL=message-channel-tool-definition.d.ts.map