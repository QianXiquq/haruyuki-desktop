import { type ModCapabilityId } from "./capabilities";
export declare const HARUYUKI_PACKAGE_MANIFEST_VERSION = 1;
export type HaruyukiPackageCapability = ModCapabilityId;
export interface HaruyukiPackageEngines {
    lettaCodeCli?: string;
    lettaCodeDesktop?: string;
}
export interface HaruyukiPackageManifest {
    manifestVersion: typeof HARUYUKI_PACKAGE_MANIFEST_VERSION;
    mods: string[];
    capabilities?: HaruyukiPackageCapability[];
    engines?: HaruyukiPackageEngines;
}
export interface HaruyukiPackageManifestValidationError {
    message: string;
    path: string;
}
export type HaruyukiPackageManifestParseResult = {
    errors: [];
    manifest: HaruyukiPackageManifest | null;
    ok: true;
} | {
    errors: HaruyukiPackageManifestValidationError[];
    manifest: null;
    ok: false;
};
export declare function isSafeHaruyukiPackageModEntryPath(value: string): boolean;
export declare function parseHaruyukiPackageManifest(packageJson: unknown): HaruyukiPackageManifestParseResult;
export declare function readHaruyukiPackageManifest(packageJsonPath: string): HaruyukiPackageManifestParseResult;
//# sourceMappingURL=package-manifest.d.ts.map