/**
 * Post-tool hook feedback: collection and attachment to model-facing tool
 * results.
 *
 * Hooks run user-configured shell commands whose children inherit the runtime
 * environment (including LETTA_API_KEY), so their feedback can echo runtime
 * credentials. All feedback attached here is scrubbed for ambient runtime auth
 * values before it reaches the model — the secret scrub of the tool's own
 * output runs earlier and cannot cover text appended afterwards.
 */
export type ToolHookContext = {
    args: Record<string, unknown>;
    debugLabel: string;
    scopedAgentId?: string;
    toolCallId?: string;
    toolName: string;
    workingDirectory: string;
};
export declare function collectPostToolHookFeedback(context: ToolHookContext, result: {
    errorType?: string;
    failureOutput?: string;
    output: string;
    status: "success" | "error";
}): Promise<string[]>;
export declare function appendHookFeedbackToText(text: string, feedback: string[]): string;
export declare function appendHookFeedbackToToolReturn<T extends string | Array<{
    type?: string;
    text?: unknown;
}>>(toolReturn: T, feedback: string[]): T;
//# sourceMappingURL=hook-feedback.d.ts.map