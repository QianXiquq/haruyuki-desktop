export type LocalMemoryFormat = "memfs-v1" | "memfs-v2";
export declare function detectMemoryFormat(memoryDir: string, _localMemfs: boolean): LocalMemoryFormat;
export declare function isCoreMemoryPath(relativePath: string, format: LocalMemoryFormat): boolean;
export declare function isProjectedMemoryPath(relativePath: string, allPaths: ReadonlySet<string>, format: LocalMemoryFormat): boolean;
//# sourceMappingURL=memory-format.d.ts.map