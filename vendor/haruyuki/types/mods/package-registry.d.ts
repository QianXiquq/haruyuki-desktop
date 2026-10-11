import { type HaruyukiPackageCapability } from "./package-manifest";
export declare const MOD_PACKAGES_REGISTRY_FILENAME = "packages.json";
export declare const MOD_PACKAGES_DIRECTORY_NAME = "packages";
export interface ManagedModPackageSource {
    entries: string[];
    files: string[];
    root: string;
    source: string;
    version: string;
}
export interface ManagedModPackageDiagnostic {
    error: Error;
    path: string;
}
export interface ResolveManagedModPackagesResult {
    diagnostics: ManagedModPackageDiagnostic[];
    files: string[];
    packages: ManagedModPackageSource[];
}
export interface ManagedModPackageListItem {
    capabilities: HaruyukiPackageCapability[];
    enabled: boolean;
    entries: string[];
    files: string[];
    registryIndex: number;
    root: string;
    rootRelativePath: string;
    source: string;
    version: string;
}
export interface ListManagedModPackagesResult {
    diagnostics: ManagedModPackageDiagnostic[];
    packages: ManagedModPackageListItem[];
    registryExists: boolean;
    registryPath: string;
}
export interface ManagedModPackageMutationResult {
    package: ManagedModPackageListItem;
    registryPath: string;
    removedRoot?: string;
}
export interface ManagedModPackageRegistrySnapshot {
    contents: string | null;
    registryPath: string;
}
export interface UpsertManagedModPackageResult extends ManagedModPackageMutationResult {
    removedDuplicates: number;
    replaced: boolean;
}
export declare function resolveManagedModPackages(modsRoot: string): ResolveManagedModPackagesResult;
export declare function listManagedModPackages(modsRoot: string): ListManagedModPackagesResult;
export declare function parseManagedNpmPackageSource(source: string): string | null;
export interface ManagedGitPackageSource {
    host: "github.com";
    owner: string;
    repo: string;
}
export declare function parseManagedGitPackageSource(source: string): ManagedGitPackageSource | null;
export declare function getManagedModPackageRootRelativePathForSource(source: string): string | null;
export declare function validateManagedModPackageRegistryForMutation(modsRoot: string): ManagedModPackageRegistrySnapshot;
export declare function setManagedModPackageEnabled(params: {
    enabled: boolean;
    modsRoot: string;
    specifier: string;
}): ManagedModPackageMutationResult;
export declare function getManagedModPackage(params: {
    modsRoot: string;
    specifier: string;
}): ManagedModPackageMutationResult;
export declare function upsertManagedModPackage(params: {
    enabled?: boolean;
    entries: string[];
    modsRoot: string;
    source: string;
    version: string;
}): UpsertManagedModPackageResult;
export declare function removeManagedModPackage(params: {
    modsRoot: string;
    specifier: string;
}): ManagedModPackageMutationResult;
//# sourceMappingURL=package-registry.d.ts.map