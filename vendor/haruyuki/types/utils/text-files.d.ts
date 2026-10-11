export type Utf16Bom = "UTF-16LE" | "UTF-16BE";
export declare function getUtf16Bom(bytes: Uint8Array): Utf16Bom | null;
export declare function invalidUtf8TextFileMessage(filePath: string, detail?: Utf16Bom): string;
export declare function decodeUtf8TextStrict(bytes: Uint8Array, filePath: string): string;
export declare function readUtf8TextStrict(filePath: string): Promise<string>;
export declare function writeUtf8Text(filePath: string, content: string): Promise<void>;
//# sourceMappingURL=text-files.d.ts.map