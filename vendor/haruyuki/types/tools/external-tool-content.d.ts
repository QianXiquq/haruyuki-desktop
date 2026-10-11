import type { ImageContent, TextContent } from "@letta-ai/letta-client/resources/agents/messages";
interface ExternalToolResultContent {
    type: string;
    text?: string;
    data?: string;
    mimeType?: string;
}
/** Convert external-tool wire content into the content shape sent to Letta. */
export declare function normalizeExternalToolResultContent(content: readonly ExternalToolResultContent[]): string | Array<TextContent | ImageContent>;
export {};
//# sourceMappingURL=external-tool-content.d.ts.map