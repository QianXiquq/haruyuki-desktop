/**
 * Singleton instance of CliPermissions.
 *
 * Keep this on globalThis instead of as a module-local singleton. The bundled
 * CLI can contain more than one copy of this module when multiple entrypoint
 * graphs are included (interactive + headless). Startup may set or clear
 * --disable-memory-guard state through one copy while permission checks read
 * from another; a global symbol makes those copies share the same state.
 */
import { CliPermissions } from "./cli";
export declare const cliPermissions: CliPermissions;
//# sourceMappingURL=cli-permissions-instance.d.ts.map