/**
 * XML formatting for channel notifications.
 *
 * Produces structured XML that the agent receives as message content.
 * Follows the same escaping patterns used in taskNotifications.ts.
 */
import type { MessageCreate } from "@letta-ai/letta-client/resources/agents/agents";
import type { InboundChannelMessage } from "./types";
/**
 * Format an inbound channel message as XML for the agent.
 *
 * Example output:
 * ```xml
 * <channel-notification source="telegram" chat_id="12345" sender_id="67890" sender_name="John">
 * Hello from Telegram!
 * </channel-notification>
 * ```
 */
export declare function buildChannelNotificationXml(msg: InboundChannelMessage): string;
/**
 * Format an inbound channel message as structured content parts.
 *
 * Attachment guidance is emitted only when this event contains inspectable
 * local paths. Reply semantics live in the scoped MessageChannel definition.
 */
export declare function formatChannelNotification(msg: InboundChannelMessage): MessageCreate["content"];
//# sourceMappingURL=xml.d.ts.map