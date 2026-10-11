import type { ChannelControlRequestEvent } from "../types";
import type { SlackBlock } from "./internal-types";
export { formatSlackToolNameForDisplay, resolveSlackConcreteActivity, SLACK_ASSISTANT_STARTUP_STATUS, SLACK_ASSISTANT_WORKING_STATUS, sanitizeSlackStatusText, } from "./progress";
export declare const SLACK_APPROVAL_ACTION_ID = "letta_channel_approval";
export declare function buildSlackChatFootnote(identity: {
    agentId: string;
    conversationId: string;
}): string;
export declare function buildSlackReplyBlocksWithFootnote(text: string, footnote: string): SlackBlock[] | undefined;
export declare function formatSlackControlRequestBlocks(event: ChannelControlRequestEvent): SlackBlock[] | undefined;
export declare function parseSlackApprovalActionPayload(value: unknown): {
    requestId: string;
    decision: "allow" | "deny";
} | null;
export declare function buildSlackApprovalDecisionBlocks(text: string): SlackBlock[];
export declare function shouldPostSlackTerminalError(stopReason: string): boolean;
export declare function formatSlackLifecycleErrorMessage(errorText: string): string;
//# sourceMappingURL=presentation.d.ts.map