interface EditArgs {
    file_path: string;
    old_string: string;
    new_string: string;
    replace_all?: boolean;
    expected_replacements?: number;
}
interface EditResult {
    message: string;
    replacements: number;
    startLine?: number;
}
/**
 * Unescapes a string that might have been overly escaped by an LLM.
 * Based on Gemini CLI's unescapeStringForGeminiBug function.
 *
 * LLMs sometimes generate strings with extra escape characters like:
 * - \\n instead of \n (newline)
 * - \\t instead of \t (tab)
 * - \\\" instead of " (quote)
 * - \\` instead of ` (backtick)
 */
export declare function unescapeOverEscapedString(input: string): string;
export declare function edit(args: EditArgs): Promise<EditResult>;
export {};
//# sourceMappingURL=edit.d.ts.map