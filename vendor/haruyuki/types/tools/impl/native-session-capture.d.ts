export type NativeSessionSource = "claude_code" | "codex";
export interface NativeSessionScope {
    agentId: string;
    conversationId: string;
}
/** Find the exact native file for a CLI session, not a stdout projection. */
export declare function findNativeSessionPath(source: NativeSessionSource, sessionId: string, env?: NodeJS.ProcessEnv): Promise<string | undefined>;
/** Scope is captured at launch, never derived from process globals after a turn. */
export declare function captureNativeSession(source: NativeSessionSource, sessionId: string, scope: NativeSessionScope | undefined, env?: NodeJS.ProcessEnv, requestOptions?: {
    baseUrl?: string;
    apiKey?: string;
    cloudUrl?: string;
}): Promise<void>;
export declare function rememberNativeSession(source: NativeSessionSource, sessionId: string, scope: NativeSessionScope, cloudUrl?: string): void;
export declare function clearNativeSessionCaptureForTests(): void;
/** Report delivery failure without logging raw transcripts or response bodies. */
export declare function reportNativeSessionCaptureFailure(source: NativeSessionSource, sessionId: string, error: unknown): void;
//# sourceMappingURL=native-session-capture.d.ts.map