import type { ModConversationMessage, ModTurnStartEvent } from "./types";
export declare function isTurnStartInput(value: unknown): value is ModTurnStartEvent["input"];
export declare function cloneTurnStartInput(input: ModTurnStartEvent["input"]): ModTurnStartEvent["input"];
export declare function preserveApprovalFirstOrdering(wasApprovalContinuation: boolean, transformedInput: ModConversationMessage[]): ModConversationMessage[];
//# sourceMappingURL=turn-start-input.d.ts.map