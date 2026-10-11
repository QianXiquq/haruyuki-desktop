/**
 * Expand a file_path argument before resolving it:
 * 1. Expand leading `~` to the home directory.
 * 2. Expand `$VAR` and `${VAR}` references using process.env (fallback: leave
 *    the token as-is so the downstream error message is still readable).
 * 3. Resolve relative paths against `userCwd`.
 */
export declare function expandFilePath(filePath: string, userCwd: string): string;
//# sourceMappingURL=file-path.d.ts.map