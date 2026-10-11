export interface GrepArgs {
    pattern: string;
    path?: string;
    glob?: string;
    output_mode?: "content" | "files_with_matches" | "count";
    "-B"?: number;
    "-A"?: number;
    "-C"?: number;
    "-n"?: boolean;
    "-i"?: boolean;
    type?: string;
    head_limit?: number;
    offset?: number;
    multiline?: boolean;
    signal?: AbortSignal;
}
interface GrepResult {
    output: string;
    matches?: number;
    files?: number;
}
export declare function grep(args: GrepArgs): Promise<GrepResult>;
export {};
//# sourceMappingURL=grep.d.ts.map