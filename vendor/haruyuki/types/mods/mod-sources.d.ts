import { type ManagedModPackageDiagnostic } from "./package-registry";
import type { ModSourceScope } from "./types";
export interface LocalModSource {
    diagnostics?: ManagedModPackageDiagnostic[];
    files: string[];
    legacyMigrationTargetRoot?: string;
    managedPackageRoots?: string[];
    root: string;
    scope: ModSourceScope;
    trusted: boolean;
}
export interface ResolveLocalModSourcesOptions {
    agentModsDirectory?: string;
    cacheDirectory?: string;
    globalModsDirectory?: string;
    includeGlobalMods?: boolean;
    legacyGlobalExtensionsDirectory?: string;
}
export declare function resolveLocalModSources(options?: ResolveLocalModSourcesOptions): LocalModSource[];
//# sourceMappingURL=mod-sources.d.ts.map