import type { ModEvents } from "../mods/event-emitter";
type ListenerBackgroundRegistration = {
    createNotificationGuard: () => ListenerExternalToolNotificationGuard | undefined;
    /** Optional foreground wait override; listener registrations use 10 seconds. */
    yieldMs?: number;
};
export type ListenerExternalToolNotificationGuard = {
    isCurrent: () => boolean;
    waitUntilCurrent: () => Promise<boolean>;
};
/** Mark an in-process listener tool as eligible for task notification delivery. */
export declare function enableListenerExternalToolBackground<T extends object>(tool: T, options: ListenerBackgroundRegistration): T;
export declare function listenerExternalToolBackgroundOptions(tool: object | undefined, events: ModEvents | undefined, runtimeScope: {
    agentId?: string | null;
    conversationId?: string | null;
}): {
    runtimeScope: typeof runtimeScope;
    canBackground: () => boolean;
    yieldMs?: number;
    shouldEnqueue?: () => Promise<boolean>;
};
export {};
//# sourceMappingURL=external-tool-background-eligibility.d.ts.map