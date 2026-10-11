import { type ModDiagnosticsReport } from "./mod-diagnostics";
import type { ModDiagnostic } from "./types";
export interface ModDiagnosticsFile {
    generatedAt: number;
    report: ModDiagnosticsReport;
}
export declare function getDefaultModDiagnosticsRoot(homeDirectory?: string): string;
export declare function getModDiagnosticsLatestFilePath(rootDirectory?: string): string;
export declare function writeModDiagnosticsLatestFile(diagnostics: readonly ModDiagnostic[], options?: {
    generatedAt?: number;
    rootDirectory?: string;
}): ModDiagnosticsFile;
//# sourceMappingURL=mod-diagnostics-file.d.ts.map