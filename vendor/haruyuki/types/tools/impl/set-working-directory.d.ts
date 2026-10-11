interface SetWorkingDirectoryResult {
    content: Array<{
        type: "text";
        text: string;
    }>;
    status: "success" | "error";
    working_directory?: string;
}
export declare function set_working_directory(rawArgs: Record<string, unknown>): Promise<SetWorkingDirectoryResult>;
export {};
//# sourceMappingURL=set-working-directory.d.ts.map