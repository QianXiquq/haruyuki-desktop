import { type ToolReturnContent } from "./read.js";
interface ReadLSPArgs {
    file_path: string;
    offset?: number;
    limit?: number;
    include_types?: boolean;
}
interface ReadLSPResult {
    content: ToolReturnContent;
}
export declare function read_lsp(args: ReadLSPArgs): Promise<ReadLSPResult>;
export {};
//# sourceMappingURL=read-lsp.d.ts.map