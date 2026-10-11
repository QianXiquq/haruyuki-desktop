import type { ChannelModelPickerData } from "../types";
export declare const SLACK_MODEL_SELECT_ACTION_ID = "letta_channel_model_select";
export declare function resolveSlackSelectedModel(action: unknown, body: unknown): string | null;
/**
 * Renders generic channel model-picker data as Slack Block Kit blocks.
 * Slack-specific rendering lives here so the shared channel/listener layers
 * stay vendor-neutral.
 */
export declare function buildSlackModelPickerBlocks(params: ChannelModelPickerData): unknown[] | undefined;
//# sourceMappingURL=model-picker-blocks.d.ts.map