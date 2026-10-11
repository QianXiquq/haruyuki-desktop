export declare const MOD_FILE_EXTENSIONS: readonly [".js", ".mjs", ".ts", ".tsx"];
export declare const TYPESCRIPT_MOD_FILE_EXTENSIONS: readonly [".ts", ".tsx"];
export type ModFileExtension = (typeof MOD_FILE_EXTENSIONS)[number];
export type TypeScriptModFileExtension = (typeof TYPESCRIPT_MOD_FILE_EXTENSIONS)[number];
export declare function isModFileExtension(value: string): value is ModFileExtension;
export declare function isTypeScriptModFileExtension(value: string): value is TypeScriptModFileExtension;
//# sourceMappingURL=file-extensions.d.ts.map