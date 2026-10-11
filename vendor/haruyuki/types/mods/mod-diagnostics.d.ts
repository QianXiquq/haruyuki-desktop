import type { ModDiagnostic, ModDiagnosticPhase, ModDiagnosticSeverity, ModOwner } from "./types";
export type { ModDiagnosticSeverity } from "./types";
export declare const MOD_DIAGNOSTICS_MAX_COUNT = 200;
export declare const MOD_DIAGNOSTICS_RESET_COUNT = 50;
export interface ModDiagnosticCollector {
    diagnostics: ModDiagnostic[];
}
export interface ModDiagnosticReportEntry {
    capability?: ModDiagnostic["capability"];
    errorName: string;
    hint?: string;
    mod: ModOwner;
    message: string;
    phase: ModDiagnosticPhase;
    severity: ModDiagnosticSeverity;
    stack?: string;
    timestamp: number;
}
export interface ModDiagnosticsReport {
    diagnostics: ModDiagnosticReportEntry[];
    errorCount: number;
    warningCount: number;
}
export declare function getModDiagnosticSeverity(phase: ModDiagnosticPhase, severity?: ModDiagnosticSeverity): ModDiagnosticSeverity;
export declare const MOD_DYNAMIC_CONTEXT_MIGRATION_HINT = "Dynamic context is now passed as ctx to commands, tools, events, permissions, and UI renderers. Use ctx.agent, ctx.cwd, ctx.conversation, ctx.model, etc.";
export declare const MOD_LETTA_GET_CONTEXT_MIGRATION_HINT = "haruyuki.getContext has been removed. Activation has no dynamic invocation context. Move dynamic work into a command, tool, event, permission, status, or statusline callback that receives ctx, or use explicit/global state such as process.cwd() for activation-time background work.";
export declare const MOD_CTX_GET_CONTEXT_MIGRATION_HINT = "ctx.getContext has been removed. Use ctx directly; scoped fields are available as ctx.agent, ctx.cwd, ctx.conversation, ctx.model, etc.";
export declare const MOD_GENERIC_GET_CONTEXT_MIGRATION_HINT = "getContext helpers have been removed. If this is callback ctx, use ctx directly; if activation/background code needs runtime state, move it into a callback that receives ctx or use explicit/global state such as process.cwd().";
export declare function getModDiagnosticHint(diagnostic: Pick<ModDiagnostic, "capability" | "error" | "phase">): string | undefined;
export declare function isModDiagnosticErrorPhase(phase: ModDiagnosticPhase): boolean;
export declare function isModDiagnosticError(diagnostic: Pick<ModDiagnostic, "phase" | "severity">): boolean;
export declare function getModErrorDiagnostics(diagnostics: readonly ModDiagnostic[]): ModDiagnostic[];
export declare function createModDiagnosticsReport(diagnostics: readonly ModDiagnostic[]): ModDiagnosticsReport;
export declare function appendModDiagnostic(collector: ModDiagnosticCollector, diagnostic: ModDiagnostic): void;
export declare function recordModDiagnostic(collector: ModDiagnosticCollector, diagnostic: Omit<ModDiagnostic, "timestamp">, onDiagnostic?: (diagnostic: ModDiagnostic) => void): ModDiagnostic;
export declare function recordStaleHandleUse(collector: ModDiagnosticCollector, owner: ModOwner, capability: ModDiagnostic["capability"], onDiagnostic?: (diagnostic: ModDiagnostic) => void): ModDiagnostic;
//# sourceMappingURL=mod-diagnostics.d.ts.map