import type { OutboundChannelMessage } from "./types";
export declare function markdownToTelegramHtml(text: string): string;
export declare function markdownToSlackMrkdwn(text: string): string;
export declare function markdownToSignalTextStyles(text: string): Pick<OutboundChannelMessage, "text" | "textStyle">;
export declare function formatOutboundChannelMessage(channel: string, text: string): Pick<OutboundChannelMessage, "text" | "parseMode" | "textStyle">;
//# sourceMappingURL=message-channel-formatting.d.ts.map