export type ShellFamily = "powershell" | "cmd" | "bash" | "unknown";
export interface ShellContext {
    family: ShellFamily;
    displayName: string;
}
export declare function detectShellContext(env?: NodeJS.ProcessEnv, currentPlatform?: NodeJS.Platform): ShellContext;
//# sourceMappingURL=shell-context.d.ts.map