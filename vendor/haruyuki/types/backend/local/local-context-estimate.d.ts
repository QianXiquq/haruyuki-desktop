import type { Usage } from "@earendil-works/pi-ai";
import type { LocalMessage } from "./local-message";
export interface LocalContextTokenEstimate {
    tokens: number;
    usageTokens: number;
    trailingTokens: number;
    lastUsageIndex: number | null;
}
export declare function contextTokensFromLocalUsage(usage: Usage): number | undefined;
export declare function estimateLocalMessageTokens(message: LocalMessage): number;
export declare function estimateLocalMessagesTokens(messages: readonly LocalMessage[]): number;
export declare function estimateLocalContextTokens(messages: readonly LocalMessage[]): LocalContextTokenEstimate;
//# sourceMappingURL=local-context-estimate.d.ts.map