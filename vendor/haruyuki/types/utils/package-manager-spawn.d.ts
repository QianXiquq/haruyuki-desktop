import { type ChildProcess, type SpawnOptions } from "node:child_process";
export type PackageManagerProcessFactory = (command: string, args: string[], options: SpawnOptions) => ChildProcess;
export declare function getPackageManagerProcessFactory({ nativeSpawn, platform, windowsSpawn, }?: {
    nativeSpawn?: PackageManagerProcessFactory;
    platform?: NodeJS.Platform;
    windowsSpawn?: PackageManagerProcessFactory;
}): PackageManagerProcessFactory;
//# sourceMappingURL=package-manager-spawn.d.ts.map