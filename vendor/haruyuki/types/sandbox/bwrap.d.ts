import type { FsSandboxPolicy } from "./policy.js";
/**
 * Linux bubblewrap backend.
 *
 * We shell out to `bwrap`, building a mount namespace that mirrors the same
 * policy model as Seatbelt:
 *
 *   - The root filesystem is bound `--ro-bind` (write-scoped profile,
 *     default-deny writes) or `--bind` (cross-agent profile, default-allow writes). This single
 *     choice implements `restrictWrites` for free: under a read-only root, the
 *     only writable paths are the explicit `--bind` carveouts.
 *   - Each denied root is masked with `--tmpfs`, so other agents' directories
 *     are not merely unwritable but *absent* — unreadable and unenumerable,
 *     strictly stronger than the static guard.
 *   - readonly / writable carveouts are re-bound on top. bwrap creates the
 *     mountpoints inside the tmpfs as needed, so a self-memory dir nested in a
 *     masked agents tree reappears.
 *
 * No `--unshare-net`: network stays open (out of scope for memory isolation).
 * `--die-with-parent` ensures the sandbox tears down with the agent process,
 * backing up the process-group kill in `shell-runner.ts`.
 *
 * Mount order matters — later operations layer over earlier ones: root → dev →
 * proc → base writable → mask denied → restore readonly → restore writable.
 * The base-writable binds come BEFORE the masks so a denied root nested inside a
 * broad base carve (the cross-agent tree under `~/.haruyuki`) is still masked.
 */
/** Default discovery name; availability probing may substitute a bundled path. */
export declare const BWRAP_BIN = "bwrap";
/**
 * Build the bwrap flag list (everything between the binary and the `--`
 * separator). The caller prepends the bwrap path and appends
 * `"--"` + the inner launcher.
 */
export declare function buildBwrapArgs(policy: FsSandboxPolicy): string[];
//# sourceMappingURL=bwrap.d.ts.map