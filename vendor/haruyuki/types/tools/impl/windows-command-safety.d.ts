interface WindowsCommandSafetyOptions {
    platform?: NodeJS.Platform;
    cwd?: string;
    homeDirectory?: string;
    env?: NodeJS.ProcessEnv;
}
export declare function assertSafeWindowsCommand(command: string, options?: WindowsCommandSafetyOptions): void;
export {};
//# sourceMappingURL=windows-command-safety.d.ts.map