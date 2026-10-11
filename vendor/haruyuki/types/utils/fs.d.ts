/**
 * File system utilities using Node.js APIs
 * Compatible with both Node.js and Bun
 */
/**
 * Read a file and return its contents as text
 */
export declare function readFile(path: string): Promise<string>;
/**
 * Write content to a file, creating parent directories if needed
 */
export declare function writeFile(path: string, content: string): Promise<void>;
/**
 * Check if a file exists
 */
export declare function exists(path: string): boolean;
/**
 * Create a directory, including parent directories
 */
export declare function mkdir(path: string, options?: {
    recursive?: boolean;
}): Promise<void>;
export declare function readJsonFile<T>(path: string): Promise<T>;
export declare function writeJsonFile(path: string, data: unknown, options?: {
    indent?: number;
}): Promise<void>;
//# sourceMappingURL=fs.d.ts.map