/**
 * Finds the last safe split point in content (paragraph boundary not inside code block).
 * Returns content.length if no safe split point found (meaning don't split).
 *
 * Used for aggressive static promotion during streaming - completed paragraphs
 * can be committed to Ink's <Static> component to reduce flicker.
 */
export declare function findLastSafeSplitPoint(content: string): number;
//# sourceMappingURL=markdown-split.d.ts.map