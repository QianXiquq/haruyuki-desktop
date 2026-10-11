export interface MessageChannelIdempotencyState {
    successfulActionKeys: string[];
    successfulTextDeliveryKeys: string[];
    successfulRelayTextDeliveryKeys?: string[];
    lastSuccessfulActionKey: string | null;
}
export interface MessageChannelIdempotencyScope {
    execute(actionKey: string | null, textDeliveryKey: string | null, effect: () => Promise<string>): Promise<string>;
    executeRelay(actionKey: string | null, textDeliveryKey: string | null, effect: () => Promise<string>): Promise<string>;
    snapshot(): MessageChannelIdempotencyState | null;
}
export declare class MessageChannelDuplicateActionError extends Error {
    constructor(state: "in-flight" | "completed");
}
/**
 * Explicit calls suppress an adjacent repeat plus text already delivered by an
 * automatic relay. Relay suppression remembers every successful text delivery,
 * regardless of whether it used send or send-rich. In-flight state cannot be
 * serialized, so snapshot returns null until all dispatches settle.
 */
export declare function createMessageChannelIdempotencyScope(state?: MessageChannelIdempotencyState): MessageChannelIdempotencyScope;
//# sourceMappingURL=message-channel-idempotency.d.ts.map