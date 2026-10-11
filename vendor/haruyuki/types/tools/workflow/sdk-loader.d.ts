/**
 * Lazy loader for @letta-ai/letta-agent-sdk.
 *
 * The SDK is a runtime dependency of letta-code, but it is imported lazily by
 * a computed specifier rather than statically: the SDK itself depends on a
 * published @letta-ai/letta-code (the Workflow tool accepts that its
 * subagents may run a version behind), and bundling that nested copy into
 * haruyuki.js would be circular and heavy. Resolution order:
 *
 *   1. HARUYUKI_AGENT_SDK_PATH env var (installed copy or checkout; overrides)
 *   2. letta-code's own dependency (resolved from this module)
 *   3. Normal module resolution from the working directory
 *   4. A direct probe of node_modules/@letta-ai/letta-agent-sdk walking up
 *      from this module and from the working directory
 *
 * Step 4 exists because the runtime caches a failed resolution for the life
 * of the process: a CLI started before `bun install` added the SDK keeps
 * failing steps 2-3 after the install, while a file URL it has never tried
 * still loads. When the package is on disk and nothing loads, the error says
 * to restart rather than to install.
 */
import type { SdkClient } from "./types.ts";
export declare function supportsPublishedResume(version: string | undefined): boolean;
export interface LoadedSdk {
    /** A local SDK client whose spawned harness uses the selected state backend. */
    createLocalClient(harnessBackend: "api" | "local"): SdkClient;
    /** Explicit opt-in until SDK #322 is released and the package is upgraded. */
    supportsAgentFreeResume: boolean;
}
/**
 * Installed copies found by walking up from each start directory, nearest
 * first. Bypasses the module resolver entirely.
 */
export declare function probeInstalledSdkDirs(startDirs: string[]): string[];
export declare function loadAgentSdk(): Promise<LoadedSdk>;
//# sourceMappingURL=sdk-loader.d.ts.map