import type { ChannelMessageActionAdapter, ChannelMessageActionContext } from "../plugin-types";
export interface CreateSlackMessageActionAdapterOptions {
    /** Expose reaction actions when the injected transport supports them. */
    react?: boolean;
    /** Expose workspace custom emoji discovery when the transport supports it. */
    listCustomEmojis?: boolean;
    /** Expose local-path uploads when the injected transport can read them. */
    uploadFile?: boolean;
    /** Host-owned proactive target resolver, when proactive sends are supported. */
    resolveMessageTarget?: ChannelMessageActionAdapter["resolveMessageTarget"];
    /** Host-owned attachment materialization, when download-file is supported. */
    downloadFile?: (context: ChannelMessageActionContext) => Promise<string>;
    /** Advertise binding actions only when the executor's host provides them. */
    bindings?: boolean;
}
/**
 * Build canonical Slack MessageChannel actions around a host-owned transport.
 * Capabilities are explicit so remote gateways never advertise local-path or
 * attachment behavior they cannot execute.
 */
export declare function createSlackMessageActionAdapter(options?: CreateSlackMessageActionAdapterOptions): ChannelMessageActionAdapter;
//# sourceMappingURL=message-action-contract.d.ts.map