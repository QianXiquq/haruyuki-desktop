import type { ApprovalResponseBody } from "../types/protocol_v2";
import type { ChannelControlRequestEvent } from "./types";
type ParsedChannelControlRequestResponse = {
    type: "response";
    response: ApprovalResponseBody;
} | {
    type: "reprompt";
    message: string;
};
export declare function formatChannelControlRequestPrompt(event: ChannelControlRequestEvent): string;
export declare function parseChannelControlRequestResponse(event: ChannelControlRequestEvent, rawText: string): ParsedChannelControlRequestResponse;
export {};
//# sourceMappingURL=interactive.d.ts.map