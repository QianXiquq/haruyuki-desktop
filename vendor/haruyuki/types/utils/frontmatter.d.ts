/**
 * Shared frontmatter parsing utility for Markdown files with YAML frontmatter
 */
/**
 * Parse a comma-separated string into an array of trimmed, non-empty strings
 */
export declare function parseCommaSeparatedList(str: string | undefined): string[];
/**
 * Get a string field from a frontmatter object, or undefined if not a string
 */
export declare function getStringField(obj: Record<string, string | string[]>, field: string): string | undefined;
/**
 * Parse frontmatter and content from a markdown file
 */
export declare function parseFrontmatter(content: string): {
    frontmatter: Record<string, string | string[]>;
    body: string;
};
/**
 * Generate frontmatter string from an object
 */
export declare function generateFrontmatter(data: Record<string, string | string[] | undefined>): string;
//# sourceMappingURL=frontmatter.d.ts.map