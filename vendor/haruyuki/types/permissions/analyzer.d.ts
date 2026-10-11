export interface ApprovalContext {
    recommendedRule: string;
    ruleDescription: string;
    approveAlwaysText: string;
    defaultScope: "project" | "session" | "user";
    allowPersistence: boolean;
    safetyLevel: "safe" | "moderate" | "dangerous";
}
/**
 * Analyze a tool execution and determine appropriate approval context
 */
type ToolArgs = Record<string, unknown>;
export declare function analyzeApprovalContext(toolName: string, toolArgs: ToolArgs, workingDirectory: string): ApprovalContext;
export {};
//# sourceMappingURL=analyzer.d.ts.map