import { type MemoryWriteSyncMode } from "./memory-git";
import { type PersonalityAssetId } from "./personality-presets";
export interface SeedPersonalityDefaultMemoryFilesParams {
    agentId: string;
    memoryDir: string;
    agentTags?: readonly string[] | null;
    syncMode?: MemoryWriteSyncMode;
}
export interface SeedPersonalityDefaultMemoryFilesResult {
    seededPaths: string[];
    skippedPaths: string[];
    errors: string[];
}
export declare function getPersonalityAssetPath(assetId: PersonalityAssetId): string;
export declare function seedPersonalityDefaultMemoryFiles(params: SeedPersonalityDefaultMemoryFilesParams): Promise<SeedPersonalityDefaultMemoryFilesResult>;
export declare function seedPersonalityDefaultMemoryFilesBestEffort(params: SeedPersonalityDefaultMemoryFilesParams): Promise<SeedPersonalityDefaultMemoryFilesResult>;
//# sourceMappingURL=personality-default-files.d.ts.map