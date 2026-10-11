export type ShellAnalysisNode = {
    type: "command";
    segment: string;
} | {
    type: "if";
    condition: string;
    thenBody: ShellAnalysisNode[];
} | {
    type: "for";
    variableName: string;
    items: string[];
    body: ShellAnalysisNode[];
};
/**
 * Split a shell command into segments on unquoted separators: |, &&, ||, ;
 * Returns null if dangerous operators are found:
 * - redirects (>, >>) outside quotes (unless targeting /dev/null or fd duplication)
 * - command substitution ($(), backticks) outside single quotes
 */
export declare function splitShellSegments(input: string): string[] | null;
/**
 * Split a shell command into segments on top-level separators while tolerating
 * `$(...)` command substitutions. This is useful for approval rule generation
 * and matching, where we still want to identify the outer command even when a
 * setup segment contains an inner pipe (e.g. `export FOO=$(grep ... | cut ...)`).
 *
 * Unlike `splitShellSegments`, this still rejects unsafe redirects, but it does
 * not reject `$()` command substitutions.
 */
export declare function splitShellSegmentsAllowCommandSubstitution(input: string): string[] | null;
export declare function isShellExecutor(command: string): boolean;
export declare function stripShellQuotes(value: string): string;
export declare function tokenizeShellWords(segment: string): string[];
export declare function extractDashCArgument(tokens: string[]): string | undefined;
export declare function substituteShellVariable(segment: string, variableName: string, value: string): string;
/**
 * Convert already-split shell segments into a structured analysis tree.
 * Returns null when the segment sequence uses unsupported or malformed control
 * flow so callers can fall back to a conservative deny.
 */
export declare function parseShellAnalysisSegments(segments: string[]): ShellAnalysisNode[] | null;
export declare function parseShellAnalysis(command: string): ShellAnalysisNode[] | null;
//# sourceMappingURL=shell-analysis.d.ts.map