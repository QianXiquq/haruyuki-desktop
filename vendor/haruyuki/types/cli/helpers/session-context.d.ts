import type { SessionContextReason } from "../../reminders/state";
import type { ShellContext } from "../../utils/shell-context";
export type SessionContextSource = "interactive-cli" | "headless" | "listen";
/**
 * Get the current local time in a human-readable format
 */
export declare function getLocalTime(): string;
/**
 * Get device type based on platform
 */
export declare function getDeviceType(): string;
export interface BuildSessionContextOptions {
    cwd?: string;
    source?: SessionContextSource;
    reason?: SessionContextReason;
    shellContext?: ShellContext;
}
export declare function buildWindowsShellNotes(shellContext?: ShellContext): string;
/**
 * Build the session context system reminder (device/environment info only).
 * Agent metadata is handled separately by buildAgentMetadata().
 * Returns empty string on any failure (graceful degradation).
 */
export declare function buildSessionContext(options?: BuildSessionContextOptions): string;
//# sourceMappingURL=session-context.d.ts.map