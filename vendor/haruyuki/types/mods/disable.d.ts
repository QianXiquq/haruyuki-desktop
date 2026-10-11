export declare const HARUYUKI_DISABLE_MODS_ENV = "HARUYUKI_DISABLE_MODS";
export declare const LEGACY_LETTA_DISABLE_EXTENSIONS_ENV = "HARUYUKI_DISABLE_EXTENSIONS";
export declare function areModsDisabled(env?: NodeJS.ProcessEnv): boolean;
export declare function shouldDisableMods(options?: {
    cliFlag?: boolean;
    env?: NodeJS.ProcessEnv;
}): boolean;
export declare function disableModsForProcess(): void;
//# sourceMappingURL=disable.d.ts.map