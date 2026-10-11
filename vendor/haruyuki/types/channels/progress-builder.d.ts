import { type ChannelTurnProgressBuilderOptions } from "./progress-formatting";
import type { ChannelTurnProgressUpdate } from "./progress-types";
/**
 * Builds sanitized channel progress updates from stream deltas for a single
 * turn. Instances accumulate fragmented tool-call arguments across deltas,
 * so they must be scoped to one conversation turn (create one per turn and
 * drop it when the turn finishes) rather than shared across conversations.
 */
export type ChannelTurnProgressBuilder = {
    buildUpdates(delta: unknown): ChannelTurnProgressUpdate[];
};
export declare function createChannelTurnProgressBuilder(options?: ChannelTurnProgressBuilderOptions): ChannelTurnProgressBuilder;
//# sourceMappingURL=progress-builder.d.ts.map