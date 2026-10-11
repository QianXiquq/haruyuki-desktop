/**
 * Pure Telegram inbound normalization shared by the local grammY adapter and
 * remote hosts (for example Cloud webhook ingress) through the public
 * `@letta-ai/letta-code/channels/telegram` subpath.
 *
 * Everything here operates on plain Bot API update shapes; no grammY import
 * and no node builtins so remote hosts reuse the exact local semantics.
 */
import type { ChannelReplyContext } from "../types";
import { type TelegramLikeMessage, type TelegramMentionResult, type TelegramReactionType, type TelegramReactionUpdate } from "./message-shapes";
export declare function escapeRegExp(value: string): string;
export declare function getTelegramMessageEntities(message: TelegramLikeMessage): Array<{
    type?: string;
    offset?: number;
    length?: number;
}>;
export declare function detectTelegramBotMention(message: TelegramLikeMessage, botUsername: string | null | undefined, botDisplayName?: string | null | undefined, text?: string): TelegramMentionResult;
export declare function getTelegramChatType(chat: {
    type?: string;
}): "direct" | "channel";
export declare function getTelegramChatLabel(message: TelegramLikeMessage): string | undefined;
export declare function getTelegramMessageThreadId(message: TelegramLikeMessage): string | null;
export declare function getTelegramReplyContext(message: TelegramLikeMessage): ChannelReplyContext | undefined;
export declare function getTelegramReactionToken(reaction: TelegramReactionType): string | null;
export declare function getTelegramReactionSenderName(update: TelegramReactionUpdate): string | undefined;
export declare function getTelegramReactionSenderId(update: TelegramReactionUpdate): string | null;
/**
 * Diff a Bot API `message_reaction` update into discrete added/removed
 * reaction events, using the same token normalization the local adapter uses.
 */
export declare function diffTelegramReactionUpdate(update: Pick<TelegramReactionUpdate, "old_reaction" | "new_reaction">): Array<{
    action: "added" | "removed";
    emoji: string;
}>;
//# sourceMappingURL=ingress.d.ts.map