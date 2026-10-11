import type { ModContext, ModDiagnostic, ModOwner, ModTool, ModToolRunContext, ModToolRunResult, ToolApprovalPolicy } from "./types";
export interface ModToolDefinition extends ModTool {
    activationSignal: AbortSignal;
    recordDiagnostic?: (diagnostic: Pick<ModDiagnostic, "capability" | "error" | "phase" | "severity">) => void;
}
export declare function filterAvailableModToolsRegistry(registry: Map<string, ModToolDefinition>, context?: ModContext | null): Map<string, ModToolDefinition>;
export declare function getAvailableModToolsRegistry(context?: ModContext | null): Map<string, ModToolDefinition>;
export declare function registerModTool(tool: ModToolDefinition): void;
export declare function unregisterModTool(name: string, owner: ModOwner): void;
export declare function unregisterModToolsForOwner(owner: ModOwner): void;
export declare function clearModTools(): void;
export declare function getModToolDefinition(name: string, registry?: Map<string, ModToolDefinition>): ModToolDefinition | undefined;
export declare function modToolRequiresApproval(name: string, registry?: Map<string, ModToolDefinition>): boolean | undefined;
export declare function modToolApprovalPolicy(name: string, registry?: Map<string, ModToolDefinition>): ToolApprovalPolicy | undefined;
export declare function isModToolParallelSafe(name: string, registry?: Map<string, ModToolDefinition>): boolean;
export declare function runModTool(tool: ModToolDefinition, context: ModToolRunContext): Promise<ModToolRunResult>;
//# sourceMappingURL=tool-registry.d.ts.map