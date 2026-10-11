import type { ChannelMessageActionAdapter, ChannelMessageActionRoute } from "../plugin-types";
export interface CreateTelegramMessageActionAdapterOptions {
    /**
     * Host-owned lookup for the account-level "rich private chat" default.
     * The local plugin reads the channel accounts store; remote hosts supply
     * their own config source. Defaults to enabled when omitted.
     */
    richPrivateChatDefaultEnabled?: (route: ChannelMessageActionRoute) => boolean;
}
/**
 * Build the canonical Telegram MessageChannel actions around a host-owned
 * transport (`ctx.adapter`). The local plugin and remote gateways share the
 * same request validation, rich-message defaulting, and thread resolution.
 */
export declare function createTelegramMessageActionAdapter(options?: CreateTelegramMessageActionAdapterOptions): ChannelMessageActionAdapter;
//# sourceMappingURL=message-action-contract.d.ts.map