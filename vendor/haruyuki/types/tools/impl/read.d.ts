import type { ImageContent, TextContent } from "@letta-ai/letta-client/resources/agents/messages";
interface ReadArgs {
    file_path: string;
    offset?: number;
    limit?: number;
}
export type ToolReturnContent = string | Array<TextContent | ImageContent>;
interface ReadResult {
    content: ToolReturnContent;
}
export declare function read(args: ReadArgs): Promise<ReadResult>;
export {};
//# sourceMappingURL=read.d.ts.map