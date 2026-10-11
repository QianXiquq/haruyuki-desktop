/**
 * Single source of truth for the harness state directory (`~/.haruyuki`) and the
 * names of everything inside it.
 *
 * Why this module exists: the directory name used to be a bare `".letta"`
 * literal in ~46 non-test files, so the rename had no single point of control.
 * `HARUYUKI_HOME` did override the root, but only two call sites read it. Resolve
 * every harness path through the helpers here so the name (and the override)
 * really is global.
 *
 * Layer: `utils/` (bottom). `backend/` owns the stores and `permissions/` builds
 * the sandbox policy, but `permissions/` sits below `backend/` and cannot import
 * it, so the shared path vocabulary has to live underneath both.
 */
/** Directory name of the harness root, as created under the user's home dir. */
export declare const APP_DIR_NAME = ".haruyuki";
/** Env override for the harness root. When set, it replaces `~/.haruyuki` outright. */
export declare const APP_HOME_ENV = "HARUYUKI_HOME";
/** Name of the repo-local ignore file, e.g. `<repo>/.haruyuki/.haruyukiignore`. */
export declare const APP_IGNORE_FILE_NAME = ".haruyukiignore";
/** Directory name of the legacy project-level skills dir (`.skills`). */
export declare const LEGACY_SKILLS_DIR_NAME = ".skills";
/**
 * Home directory used by path resolution: `HOME`, then `USERPROFILE`, then
 * `os.homedir()`.
 *
 * The env vars come first because several call sites already resolved home that
 * way and tests override `HOME` per case; `os.homedir()` is the fallback for
 * processes that only have the OS-level value.
 */
export declare function resolveHomeDir(env?: NodeJS.ProcessEnv): string;
/** `".haruyuki"` — for the few places that need the name as a path segment. */
export declare function appHomeDirName(): string;
/** Directory names inside the harness root. */
export declare const APP_SUBDIRS: {
    readonly agents: "agents";
    readonly artifacts: "artifacts";
    readonly bin: "bin";
    readonly cache: "cache";
    readonly channels: "channels";
    readonly commands: "commands";
    readonly extensions: "extensions";
    readonly logs: "logs";
    readonly modCache: "mod-cache";
    readonly mods: "mods";
    readonly plans: "plans";
    readonly skills: "skills";
    readonly transcripts: "transcripts";
    readonly viewers: "viewers";
    readonly workflows: "workflows";
    readonly worktrees: "worktrees";
    readonly localBackend: "lc-local-backend";
    readonly settingsFile: "settings.json";
    readonly localSettingsFile: "settings.local.json";
    readonly desktopPreferencesFile: "desktop_preferences.json";
};
/**
 * Explicit harness root: the `HARUYUKI_HOME` override, or `undefined` to mean
 * "under the home directory". Callers that must distinguish an explicit root
 * (for example settings precedence) use this; most code wants
 * {@link appHomeRoot}.
 */
export declare function getAppHomeOverride(env?: NodeJS.ProcessEnv): string | undefined;
/**
 * Absolute harness root. Resolved on every call because both `HOME` and
 * `HARUYUKI_HOME` may change at runtime (the test preload redirects home).
 */
export declare function appHomeRoot(homeDir?: string, env?: NodeJS.ProcessEnv): string;
export interface AppHomePathOptions {
    /** Home directory to resolve `~/.haruyuki` against. Defaults to {@link resolveHomeDir}. */
    homeDir?: string;
    /** Environment used for the harness-root override. Defaults to `process.env`. */
    env?: NodeJS.ProcessEnv;
}
/** Absolute path of a named directory inside the harness root. */
export declare function appHomePath(segments: readonly string[], options?: AppHomePathOptions): string;
/**
 * Absolute path of a named directory inside the *project*-level harness dir,
 * e.g. `<repo>/.haruyuki/settings.local.json`.
 */
export declare function projectAppHomePath(workingDirectory: string, ...segments: string[]): string;
//# sourceMappingURL=app-paths.d.ts.map