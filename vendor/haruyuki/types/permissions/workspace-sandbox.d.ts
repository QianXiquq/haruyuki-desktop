import type { RuntimeWorkspaceSandbox } from "../runtime-context";
import { type SandboxAvailability } from "../sandbox/availability";
import { type FsSandboxPolicy } from "../sandbox/policy";
type ToolArgs = Record<string, unknown>;
export interface WorkspaceSandboxInput {
    root: string;
    isolationRoot: string;
}
export declare function resolveWorkspaceSandbox(input: WorkspaceSandboxInput, options?: {
    availability?: SandboxAvailability;
}): RuntimeWorkspaceSandbox;
export declare function buildWorkspaceSandboxPolicy(sandbox: RuntimeWorkspaceSandbox): FsSandboxPolicy;
export interface WorkspaceSandboxGuardResult {
    matchedRule: "workspace sandbox";
    reason: string;
}
export declare function evaluateWorkspaceSandboxGuard(toolName: string, toolArgs: ToolArgs, workingDirectory: string, sandbox?: RuntimeWorkspaceSandbox): WorkspaceSandboxGuardResult | null;
export {};
//# sourceMappingURL=workspace-sandbox.d.ts.map