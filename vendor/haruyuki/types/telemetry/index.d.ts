export type TelemetrySurface = "letta_code_tui" | "letta_code_headless" | "letta_code_cli_server" | "letta_code_desktop";
export interface TelemetryInitOptions {
    /**
     * Retained for call-site compatibility. The SIGINT drain handler that read it
     * belonged to the removed cloud transport.
     */
    handleSigint?: boolean;
}
export interface TelemetryEvent {
    type: "session_start" | "session_end" | "tool_usage" | "error" | "user_input" | "channel_gateway_lifecycle" | "reflection_start" | "reflection_end" | "reflection_worktree_cleanup";
    timestamp: string;
    data: Record<string, unknown>;
}
export interface SessionStartData {
    startup_command: string;
    version: string;
    platform: string;
    node_version: string;
}
export interface SessionEndData {
    duration: number;
    message_count: number;
    tool_call_count: number;
    exit_reason?: string;
    total_api_ms?: number;
    total_wall_ms?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    cached_input_tokens?: number;
    cached_tokens?: number;
    cache_write_tokens?: number;
    reasoning_tokens?: number;
    context_tokens?: number;
    step_count?: number;
}
export interface ToolUsageData {
    tool_name: string;
    channel?: string;
    channel_action?: string;
    success: boolean;
    duration: number;
    response_length?: number;
    error_type?: string;
    stderr?: string;
}
export interface ErrorData {
    error_type: string;
    error_message: string;
    context?: string;
    http_status?: number;
    model_id?: string;
    run_id?: string;
    recent_chunks?: Record<string, unknown>[];
    debug_log_tail?: string;
    is_subagent?: boolean;
    subagent_type?: string;
    model_handle?: string;
    fallback_kind?: string;
    platform?: string;
    version?: string;
}
export interface UserInputData {
    input_length: number;
    channel?: string;
    is_command: boolean;
    command_name?: string;
    message_type: string;
    model_id: string;
}
export interface ChannelGatewayLifecycleData {
    lifecycle_event: "exit" | "process_error" | "restart_scheduled" | "restart_ready" | "restart_exhausted";
    restart_attempt: number;
    max_restart_attempts: number;
    restore_mode: "explicit_channels" | "enabled_accounts";
    channel_types: string[];
    duration_ms?: number;
    delay_ms?: number;
    exit_code?: number | null;
    signal?: string | null;
    reached_ready?: boolean;
    version?: string;
    platform?: string;
}
export type ReflectionTriggerSource = "manual" | "step-count" | "compaction-event";
export interface ReflectionStartData {
    trigger_source: ReflectionTriggerSource;
    subagent_id?: string;
    conversation_id?: string;
    start_message_id?: string;
    end_message_id?: string;
    model?: string;
    version?: string;
    platform?: string;
}
export interface ReflectionEndData {
    trigger_source: ReflectionTriggerSource;
    success: boolean;
    subagent_id?: string;
    conversation_id?: string;
    error?: string;
    step_count?: number;
    duration_ms?: number;
    model?: string;
    version?: string;
    platform?: string;
}
export type ReflectionWorktreeCleanupOutcome = "parent_dirty" | "merge_conflict" | "reflection_worktree_dirty" | "subagent_failed";
export interface ReflectionWorktreeCleanupData {
    outcome: ReflectionWorktreeCleanupOutcome;
    integration_status: "parent_dirty" | "merge_conflict" | "dirty_uncommitted" | "failed";
    trigger_source?: ReflectionTriggerSource;
    subagent_id?: string;
    conversation_id?: string;
    reflection_worktree_id?: string;
    commit_count?: number;
    model?: string;
    version?: string;
    platform?: string;
}
export declare function isLettaCodeDesktopRuntime(env?: NodeJS.ProcessEnv): boolean;
export declare function getTerminalTelemetrySurface(isHeadless: boolean): TelemetrySurface;
export declare function getListenerTelemetrySurface(env?: NodeJS.ProcessEnv): TelemetrySurface;
declare class TelemetryManager {
    private sessionId;
    private currentAgentId;
    private currentAgentOrigin;
    private surface;
    private sessionStartTime;
    private messageCount;
    private toolCallCount;
    private sessionEndTracked;
    private initialized;
    private removeFatalErrorHandlers;
    private sessionStatsGetter?;
    constructor();
    private generateSessionId;
    /**
     * Check if telemetry is enabled based on environment variables.
     * Enabled by default unless explicitly disabled.
     */
    private isTelemetryEnabled;
    /**
     * Install the crash handlers.
     *
     * Analytics are no longer collected, so this is the only thing init() still
     * does: it keeps the fatal handlers that pin a non-zero exit code and route
     * the crash into the local boundary-error log.
     */
    init(_options?: TelemetryInitOptions): void;
    /**
     * Analytics sink, intentionally inert.
     *
     * The event pipeline, its queue and its transport are gone. The typed
     * per-event methods below are retained so their ~100 call sites stay
     * untouched; they still maintain local counters and session state, and
     * trackError writes to the local boundary-error log rather than calling
     * here. Deleting the remaining call sites is a pure-deletion follow-up.
     */
    private track;
    /**
     * Set the current agent ID (called from App.tsx when agent changes).
     * trackError stamps it onto local boundary-error entries.
     */
    setCurrentAgentId(agentId: string | null): void;
    /**
     * Record the origin of an agent the caller already loaded, so boundary
     * errors carry it without another API request.
     */
    setCurrentAgent(agentId: string | null, tags: readonly string[] | null | undefined): void;
    setSurface(surface: TelemetrySurface): void;
    /**
     * Always null: the version came from a /v1/health probe against the cloud
     * server. Callers keep the method so their payload shape is unchanged.
     */
    getServerVersion(): string | null;
    /**
     * Set a getter function for session stats (called from App.tsx)
     * This allows safety net handlers to access stats even if not explicitly passed
     * Pass undefined to clear the getter (for cleanup)
     */
    setSessionStatsGetter(getter?: () => {
        totalWallMs: number;
        totalApiMs: number;
        usage: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
            cachedInputTokens: number;
            cacheWriteTokens: number;
            reasoningTokens: number;
            contextTokens?: number;
            stepCount: number;
        };
    }): void;
    /**
     * Get the current session ID
     */
    getSessionId(): string;
    /**
     * Get the current message count
     */
    getMessageCount(): number;
    /**
     * Get the current tool call count
     */
    getToolCallCount(): number;
    /**
     * Track session start
     */
    trackSessionStart(): void;
    /**
     * Track session end
     * @param stats Optional session stats (from sessionStatsRef.current.getSnapshot() in App.tsx)
     * @param exitReason Optional reason for exit (e.g., "exit_command", "logout", "sigint", "process_exit")
     */
    trackSessionEnd(stats?: {
        totalWallMs: number;
        totalApiMs: number;
        usage: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
            cachedInputTokens: number;
            cacheWriteTokens: number;
            reasoningTokens: number;
            contextTokens?: number;
            stepCount: number;
        };
    }, exitReason?: string): void;
    /**
     * Track tool usage
     */
    trackToolUsage(toolName: string, success: boolean, duration: number, responseLength?: number, errorType?: string, stderr?: string, channelMetadata?: Pick<ToolUsageData, "channel" | "channel_action">): void;
    trackChannelGatewayLifecycle(data: Omit<ChannelGatewayLifecycleData, "version" | "platform">): void;
    /**
     * Append a boundary error to the local JSONL log.
     *
     * The cloud-only guard is gone on purpose: it read isCloudUser(), which is
     * false under the local backend, so every one of the callers below used to
     * drop its error silently. The local log replaces the upload, which means
     * local mode keeps diagnostics it never had before.
     */
    trackError(errorType: string, errorMessage: string, context?: string, options?: {
        httpStatus?: number;
        modelId?: string;
        runId?: string;
        recentChunks?: Record<string, unknown>[];
        isSubagent?: boolean;
        subagentType?: string;
        modelHandle?: string;
        fallbackKind?: string;
        omitDebugLogTail?: boolean;
    }): void;
    /** Agent ID is automatically added to user input from currentAgentId. */
    trackUserInput(input: string, messageType: string, modelId: string): void;
    /**
     * Track reflection start events (manual and auto-triggered).
     */
    trackReflectionStart(triggerSource: ReflectionTriggerSource, options?: {
        subagentId?: string;
        conversationId?: string;
        startMessageId?: string;
        endMessageId?: string;
        model?: string | null;
    }): void;
    /**
     * Track reflection completion events.
     */
    trackReflectionEnd(triggerSource: ReflectionTriggerSource, success: boolean, options?: {
        subagentId?: string;
        conversationId?: string;
        error?: string;
        stepCount?: number;
        durationMs?: number;
        model?: string | null;
    }): void;
    trackReflectionWorktreeCleanup(options: Omit<ReflectionWorktreeCleanupData, "version" | "platform">): void;
    /**
     * No-op: there is no queue and no transport left. Boundary errors are written
     * synchronously by trackError, so shutdown has nothing to flush. The method
     * stays because ~10 call sites await it on exit paths.
     */
    flush(): Promise<void>;
    /** No-op counterpart to flush(), retained for shutdown call sites. */
    drain(): Promise<void>;
    /**
     * Clean up resources
     */
    cleanup(): void;
}
export declare const telemetry: TelemetryManager;
export {};
//# sourceMappingURL=index.d.ts.map