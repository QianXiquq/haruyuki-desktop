import type { AgentCreateBody } from "../backend";
export interface InitialLocalMemoryFile {
    relativePath: string;
    content: string;
}
export declare function initialMemoryFilesFromCreateBody(body: AgentCreateBody): InitialLocalMemoryFile[];
//# sourceMappingURL=initial-memory.d.ts.map