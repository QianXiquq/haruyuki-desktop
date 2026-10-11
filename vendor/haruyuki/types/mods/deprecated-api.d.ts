import type { ModDiagnostic } from "./types";
export type DeprecatedApiDiagnosticRecorder = (diagnostic: Pick<ModDiagnostic, "capability" | "error" | "phase" | "severity">) => void;
export declare function createDeprecatedApiTrap(apiId: string, recordDiagnostic?: DeprecatedApiDiagnosticRecorder): () => never;
export declare function attachDeprecatedGetContextTrap<T extends object>(context: T, recordDiagnostic?: DeprecatedApiDiagnosticRecorder, apiId?: string): T;
export declare function findDeprecatedContextApiUsages(source: string): string[];
export declare function recordDeprecatedContextApiSourceDiagnostics(source: string, recordDiagnostic: DeprecatedApiDiagnosticRecorder): void;
//# sourceMappingURL=deprecated-api.d.ts.map