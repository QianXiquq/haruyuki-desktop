/**
 * Centralized directory/memfs limits with env overrides for rapid testing.
 */
export declare const DIRECTORY_LIMIT_ENV: {
    readonly memfsTreeMaxLines: "HARUYUKI_MEMFS_TREE_MAX_LINES";
    readonly memfsTreeMaxChars: "HARUYUKI_MEMFS_TREE_MAX_CHARS";
    readonly memfsTreeMaxChildrenPerDir: "HARUYUKI_MEMFS_TREE_MAX_CHILDREN_PER_DIR";
    readonly listDirMaxLimit: "HARUYUKI_LIST_DIR_MAX_LIMIT";
    readonly listDirMaxDepth: "HARUYUKI_LIST_DIR_MAX_DEPTH";
    readonly listDirMaxOffset: "HARUYUKI_LIST_DIR_MAX_OFFSET";
    readonly listDirMaxCollectedEntries: "HARUYUKI_LIST_DIR_MAX_COLLECTED_ENTRIES";
    readonly listDirMaxChildrenPerDir: "HARUYUKI_LIST_DIR_MAX_CHILDREN_PER_DIR";
};
export declare const DIRECTORY_LIMIT_DEFAULTS: {
    readonly memfsTreeMaxLines: 500;
    readonly memfsTreeMaxChars: 20000;
    readonly memfsTreeMaxChildrenPerDir: 50;
    readonly listDirMaxLimit: 200;
    readonly listDirMaxDepth: 5;
    readonly listDirMaxOffset: 10000;
    readonly listDirMaxCollectedEntries: 12000;
    readonly listDirMaxChildrenPerDir: 50;
};
export interface DirectoryLimits {
    memfsTreeMaxLines: number;
    memfsTreeMaxChars: number;
    memfsTreeMaxChildrenPerDir: number;
    listDirMaxLimit: number;
    listDirMaxDepth: number;
    listDirMaxOffset: number;
    listDirMaxCollectedEntries: number;
    listDirMaxChildrenPerDir: number;
}
export declare function getDirectoryLimits(env?: NodeJS.ProcessEnv): DirectoryLimits;
//# sourceMappingURL=directory-limits.d.ts.map