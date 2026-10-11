interface WriteArgs {
    file_path: string;
    content: string;
}
interface WriteResult {
    message: string;
}
export declare function write(args: WriteArgs): Promise<WriteResult>;
export {};
//# sourceMappingURL=write.d.ts.map