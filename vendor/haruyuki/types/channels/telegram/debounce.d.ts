import type { TelegramChannelAccount } from "../types";
declare const TELEGRAM_DEBOUNCE_DEFAULT_MS = 0;
declare const TELEGRAM_DEBOUNCE_MAX_MS = 10000;
/**
 * Resolve the inbound debounce window for Telegram.
 *
 * Priority: env var > account config > default (disabled).
 * Returns `0` to disable. Clamped to `0..10000`.
 */
export declare function resolveTelegramInboundDebounceMs(config: Pick<TelegramChannelAccount, "inboundDebounceMs">): number;
export type TelegramDebounceInput = {
    chatId: string;
    threadId?: string | null;
};
/**
 * Group Telegram bursts by account + chat/topic. Unlike Slack DMs, Telegram
 * group chat bursts should merge across senders so the agent sees a coherent
 * slice of the room rather than three separate turns racing each other.
 */
export declare function buildTelegramDebounceKey(input: TelegramDebounceInput, accountId: string): string | null;
export { TELEGRAM_DEBOUNCE_DEFAULT_MS, TELEGRAM_DEBOUNCE_MAX_MS };
//# sourceMappingURL=debounce.d.ts.map