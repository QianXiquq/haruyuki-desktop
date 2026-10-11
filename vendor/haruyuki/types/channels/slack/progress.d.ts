import type { ChannelTurnProgressEvent } from "../types";
export declare const SLACK_ASSISTANT_STARTUP_STATUS = "is thinking...";
export declare const SLACK_ASSISTANT_WORKING_STATUS = "is working...";
export declare function sanitizeSlackStatusText(text: string, maxLength: number): string;
export declare function formatSlackToolNameForDisplay(toolName: string): string;
export declare function resolveSlackConcreteActivity(event: ChannelTurnProgressEvent): string | null;
//# sourceMappingURL=progress.d.ts.map