/**
 * UpdatePlan tool implementation
 *
 * This is a no-op tool that exists purely to give the model a structured way
 * to communicate its plan to the client for rendering. The tool call arguments
 * are what matter, not the execution.
 *
 * Matches the Codex update_plan tool behavior.
 */
export declare function update_plan(_args: Record<string, unknown>): Promise<{
    message: string;
}>;
//# sourceMappingURL=update-plan.d.ts.map