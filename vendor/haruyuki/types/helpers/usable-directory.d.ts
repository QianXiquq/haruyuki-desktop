import { type Stats } from "node:fs";
export type DirectoryUsability = "usable" | "missing" | "not-directory" | "unknown";
type DirectoryStat = (dirPath: string) => Pick<Stats, "isDirectory"> | undefined;
export declare function getDirectoryUsability(dirPath: string | null | undefined, statDirectory?: DirectoryStat): DirectoryUsability;
export declare function isConfirmedUnusableDirectory(dirPath: string | null | undefined, statDirectory?: DirectoryStat): boolean;
/** True when the path exists and is a directory. */
export declare function isUsableDirectory(dirPath: string | null | undefined): boolean;
export {};
//# sourceMappingURL=usable-directory.d.ts.map