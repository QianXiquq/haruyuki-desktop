/**
 * Run git in a memory repo, returning stdout. Callers own the failure policy
 * (every current caller is best-effort and swallows the error); stderr is
 * discarded so a missing revision never reaches the user as a raw git message.
 */
export declare function gitOutput(memoryDir: string, args: string[]): string;
//# sourceMappingURL=memory-git.d.ts.map