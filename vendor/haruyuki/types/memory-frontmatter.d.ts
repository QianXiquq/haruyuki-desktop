export interface MemoryFileFrontmatterInput {
    path: string;
    content: string;
    /** Accepted contents of this path, never contents supplied by the change. */
    previousContent: string | null;
    format: "memfs-v2" | "legacy";
}
/**
 * Canonical content checks used by the installed hook and external tree readers.
 * The caller selects projected paths and supplies the trusted layout/base.
 * Legacy callers select added/modified files; v2 callers select the whole tree.
 * Ref operations, deletion/rename protection and policy authorization remain
 * caller responsibilities, not decisions made from the proposed file contents.
 * This is deliberately self-contained: the Git hook embeds its source so it
 * does not depend on a package installation in the memory repository.
 */
export declare function validateMemoryFileFrontmatter({ path, content, previousContent, format, }: MemoryFileFrontmatterInput): string[];
//# sourceMappingURL=memory-frontmatter.d.ts.map