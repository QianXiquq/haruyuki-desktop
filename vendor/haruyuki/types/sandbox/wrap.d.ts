import type { FsSandboxPolicy, SandboxBackend } from "./policy.js";
export interface WrapOptions {
    /** Which backend to render for. `null` disables wrapping (returns null). */
    backend: SandboxBackend | null;
    /** Resolved bwrap binary path (system or bundled). Defaults to `bwrap`. */
    bwrapPath?: string;
}
/**
 * Wrap an inner launcher (e.g. `["/bin/zsh", "-c", cmd]`) so it runs under the
 * given sandbox backend with the given policy. Returns the wrapped argv, or
 * `null` when no backend is available — in which case the caller spawns the
 * launcher unchanged (falling back to the static guard tier).
 *
 * Backend selection is the caller's job (see `availability.ts`); this function
 * only renders argv, which keeps it a pure, snapshot-testable transform.
 */
export declare function wrapLauncher(launcher: string[], policy: FsSandboxPolicy, options: WrapOptions): string[] | null;
//# sourceMappingURL=wrap.d.ts.map