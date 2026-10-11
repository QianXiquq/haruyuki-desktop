type ShellLaunchOptions = {
    login?: boolean;
    env?: NodeJS.ProcessEnv;
    powershellEnvAliases?: string[];
    preservePowerShellExitCode?: boolean;
};
export declare const STRICT_SHELL_ENV_VAR = "HARUYUKI_BASH_STRICT";
export declare const STRICT_SHELL_PRELUDE = "set -euo pipefail";
export declare const POWERSHELL_UTF8_OUTPUT_PREFIX = "try { [Console]::OutputEncoding=[System.Text.Encoding]::UTF8 } catch {}\n";
export declare const POWERSHELL_EXIT_CODE_SUFFIX: string;
export declare function withStrictShellPrelude(command: string, env?: NodeJS.ProcessEnv): string;
export declare function buildPowerShellCommand(command: string, envAliases?: string[], preserveExitCode?: boolean): string;
export declare function selectAvailableShellLauncher(launchers: string[][], env?: NodeJS.ProcessEnv): string[] | undefined;
export declare function buildShellLaunchers(command: string, options?: ShellLaunchOptions): string[][];
export {};
//# sourceMappingURL=shell-launchers.d.ts.map