import type { SlackAllowBotsMode } from "../types";
export type SlackResolvedAllowBotsMode = "off" | "mentions";
export declare function isValidSlackAllowBotsConfigValue(value: unknown): value is SlackAllowBotsMode | undefined;
export declare function normalizeSlackAllowBotsMode(value: unknown): SlackAllowBotsMode;
export declare function resolveSlackAllowBotsMode(value: SlackAllowBotsMode | undefined): SlackResolvedAllowBotsMode;
type SlackBotPolicyMessage = {
    user?: unknown;
    bot_id?: unknown;
    subtype?: unknown;
};
export declare function isSlackBotAuthoredInboundMessage(message: SlackBotPolicyMessage): boolean;
export declare function isOwnSlackBotInboundMessage(params: {
    message: SlackBotPolicyMessage;
    botUserId: string | null;
    botId: string | null;
}): boolean;
export declare function shouldAcceptSlackInboundBotMessage(params: {
    message: SlackBotPolicyMessage;
    allowBots: SlackAllowBotsMode | undefined;
    botUserId: string | null;
    botId: string | null;
    wasMentioned: boolean;
}): boolean;
export {};
//# sourceMappingURL=bot-policy.d.ts.map