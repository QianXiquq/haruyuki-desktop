/**
 * Pure Telegram outbound payload builders shared by the local grammY adapter
 * and remote hosts (for example Cloud Bot API senders) through the public
 * `@letta-ai/letta-code/channels/telegram` subpath.
 *
 * Everything here builds plain Bot API payload objects; no grammY import and
 * no node builtins.
 */
import type { ChannelRichMessage, OutboundChannelMessage, OutboundChannelRichMessageDraft } from "../types";
import type { TelegramInputRichMessage, TelegramReactionInput, TelegramRichMessageDraftPayload, TelegramRichMessagePayload } from "./message-shapes";
export declare function resolveTelegramOutboundThreadId(msg: {
    threadId?: string | null;
}): string | null;
export declare function buildTelegramReplyOptions(msg: Pick<OutboundChannelMessage, "chatId" | "replyToMessageId" | "threadId" | "parseMode" | "text" | "title">): Record<string, unknown>;
export declare function toTelegramInputRichMessage(richMessage: ChannelRichMessage): TelegramInputRichMessage;
export declare function buildTelegramRichMessagePayload(msg: Pick<OutboundChannelMessage, "chatId" | "replyToMessageId" | "threadId" | "richMessage">): TelegramRichMessagePayload;
export declare function buildTelegramRichMessageDraftPayload(draft: Pick<OutboundChannelRichMessageDraft, "chatId" | "threadId" | "draftId" | "richMessage">): TelegramRichMessageDraftPayload;
export declare function getTelegramErrorText(error: unknown): string;
export declare function shouldFallbackTelegramRichMessage(error: unknown): boolean;
export declare function parseTelegramReactionInput(reaction: string): TelegramReactionInput | null;
//# sourceMappingURL=outbound.d.ts.map