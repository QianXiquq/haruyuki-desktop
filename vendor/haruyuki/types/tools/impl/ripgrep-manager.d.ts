export declare function getManagedToolsDir(env?: NodeJS.ProcessEnv): string;
interface RipgrepPathOptions {
    env?: NodeJS.ProcessEnv;
}
export declare function getRipgrepPath(options?: RipgrepPathOptions): string | null;
export declare function ensureRipgrep(silent?: boolean): Promise<string | undefined>;
export declare function getRipgrepBinDir(options?: RipgrepPathOptions): string | undefined;
export {};
//# sourceMappingURL=ripgrep-manager.d.ts.map