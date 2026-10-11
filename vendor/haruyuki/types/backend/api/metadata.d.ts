export interface BalanceMetadata {
    total_balance: number;
    monthly_credit_balance: number;
    purchased_credit_balance: number;
    billing_tier: string;
}
type QuotaBucket = "empty" | "low" | "medium" | "high" | "full";
interface ModelTierQuota {
    bucket: QuotaBucket;
    dailyBucket?: QuotaBucket;
}
export interface ModelQuotaMetadata {
    lettaTier: ModelTierQuota;
    quotaWindowEnd: string;
    dailyQuotaWindowEnd?: string;
}
export type FeedbackClientType = "desktop" | "chat.letta.com" | "cli";
export declare function getFeedbackClientType(env?: NodeJS.ProcessEnv): FeedbackClientType;
export declare function getBalanceMetadata(): Promise<BalanceMetadata>;
export declare function getModelQuotaMetadata(): Promise<ModelQuotaMetadata>;
export declare function getBillingTier(): Promise<string | null>;
/**
 * Record a feedback submission locally.
 *
 * This used to POST to `https://api.letta.com/v1/metadata/feedback` unless a
 * Desktop runtime had a loopback server configured. There is no Cloud backend
 * any more, so the submission is written to
 * `~/.haruyuki/logs/feedback.jsonl` instead: the report still survives on disk for
 * the user to attach to an issue, and nothing leaves the machine.
 *
 * Stays async so the call sites keep their shape.
 */
export declare function submitFeedbackMetadata(deviceId: string, payload: Record<string, unknown>): Promise<void>;
export {};
//# sourceMappingURL=metadata.d.ts.map