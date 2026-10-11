export { type MemoryFileFrontmatterInput, validateMemoryFileFrontmatter, } from "./memory-frontmatter";
export interface MemoryFileCharacterLimit {
    pattern: string;
    maxCharacters: number | null;
}
export interface MemoryConstraintsConfig {
    version: 1;
    maxDepth?: number;
    maxFileCharacters?: number;
    maxCoreMemoryCharacters?: number;
    fileCharacterLimits?: MemoryFileCharacterLimit[];
}
export interface MemoryTreeReader {
    listFiles(): Promise<Array<{
        path: string;
        mode: string;
    }>>;
    readFile(path: string): Promise<Uint8Array | null>;
    /** Optional streaming count in Unicode code points, avoiding buffering large blobs. */
    countCharacters?(path: string): Promise<number>;
}
export interface MemoryTreeConstraintsOptions {
    config: MemoryConstraintsConfig;
    layout: "root-marker" | "legacy-only" | "shared-memory";
    requireRootMarker: boolean;
}
/** Shared budget/index checks. Caller supplies trusted policy and layout.
 * Self-contained so the local hook can embed the same implementation.
 */
export declare function validateMemoryTreeConstraints(reader: MemoryTreeReader, options: MemoryTreeConstraintsOptions): Promise<string[]>;
export declare const MEMORY_CONSTRAINTS_CONFIG_PATH = ".memfs.config.json";
export declare const MEMORY_CONSTRAINTS_CONFIG_VERSION = 1;
/** Parse the tracked policy without filling defaults or changing override order.
 * Keep this function self-contained: the installed Git hook embeds its source.
 */
export declare function parseMemoryConstraintsConfig(content: string): MemoryConstraintsConfig;
export declare const DEFAULT_MEMORY_CONSTRAINTS_CONFIG: Readonly<MemoryConstraintsConfig>;
export declare const DEFAULT_MEMORY_CONSTRAINTS_CONFIG_CONTENT: string;
//# sourceMappingURL=memory-constraints.d.ts.map