export declare const LISTENER_HEARTBEAT_INTERVAL_MS = 30000;
export declare const LISTENER_PONG_TIMEOUT_MS = 90000;
/**
 * Returns true when the listener has not observed a peer `pong` within
 * `timeoutMs`, indicating a likely half-open socket that should be terminated
 * to trigger a reconnect. Returns false when no pong has been recorded yet
 * (`lastPongAt === null`) so a freshly-connected socket is never killed before
 * its first heartbeat round-trip completes.
 */
export declare function isListenerPongStale(lastPongAt: number | null, now: number, timeoutMs: number): boolean;
export declare const SYSTEM_REMINDER_RE: RegExp;
export declare const LISTENER_STREAM_RESUME_POLICY: {
    initialDelayMs: number;
    maxAttempts: number;
    maxDelayMs: number;
};
export declare const LLM_API_ERROR_MAX_RETRIES = 3;
export declare const CLOUD_API_DEPLOYMENT_RECOVERY_MAX_ATTEMPTS = 3;
export declare const EMPTY_RESPONSE_MAX_RETRIES = 2;
export declare const MAX_PRE_STREAM_RECOVERY = 2;
export declare const MAX_POST_STOP_APPROVAL_RECOVERY = 2;
//# sourceMappingURL=constants.d.ts.map