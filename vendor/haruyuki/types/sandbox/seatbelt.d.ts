import type { FsSandboxPolicy } from "./policy.js";
/**
 * macOS Seatbelt backend.
 *
 * We shell out to `/usr/bin/sandbox-exec` with an inline SBPL profile (`-p`).
 * Concrete paths are passed as `-D` parameters and referenced in the profile as
 * `(param "NAME")`, so the profile text never needs SBPL string escaping and
 * paths with spaces / quotes are safe (we spawn argv directly, no shell).
 *
 * The profile is `(allow default)` plus targeted denies — deliberately narrower
 * than Codex's Chrome-derived `(deny default)` base. Our threat model is
 * filesystem scoping for memory isolation, not general untrusted-code
 * confinement, so allow-default keeps network, signals, ttys, and arbitrary dev
 * tools working untouched while the FS rules do the isolation. SBPL is
 * last-match-wins, which is why the deny/allow ordering below matters.
 */
/** Hardcoded path — never resolved via PATH, to defend against a planted
 * `sandbox-exec` earlier on PATH (same rationale as Codex). */
export declare const SANDBOX_EXEC_PATH = "/usr/bin/sandbox-exec";
interface SeatbeltDefine {
    name: string;
    value: string;
}
/**
 * Build the SBPL profile text plus the `-D NAME=value` defines it references.
 * Exposed for snapshot testing; `buildSeatbeltArgs` is what callers use.
 */
export declare function buildSeatbeltProfile(policy: FsSandboxPolicy): {
    profile: string;
    defines: SeatbeltDefine[];
};
/**
 * Build the argv tail for `sandbox-exec`: `["-p", <profile>, "-DNAME=value",
 * ...]`. The caller prepends {@link SANDBOX_EXEC_PATH} and appends
 * `"--"` + the inner launcher.
 */
export declare function buildSeatbeltArgs(policy: FsSandboxPolicy): string[];
export {};
//# sourceMappingURL=seatbelt.d.ts.map