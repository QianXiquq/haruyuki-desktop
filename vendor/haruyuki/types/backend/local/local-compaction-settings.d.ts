/**
 * How local compaction settings are validated, merged, and resolved.
 *
 * Kept out of `local-backend.ts` because it is pure policy — no store, no
 * provider, no conversation — and because the backend file is on the size
 * ratchet. Two rules live here:
 *
 * - the local backend converges on `sliding_window` (`all` is gone, D-107):
 *   reading a stored `mode: "all"` falls back to the default instead of
 *   resurrecting a mode the planner no longer implements, while *writing* one is
 *   rejected outright;
 * - a request that changes only the mode drops the agent's custom summary prompt,
 *   because that prompt was written for the previous mode.
 */
import type { ConversationMessageCompactBody } from "../backend";
import { type LocalCompactionMode } from "./compaction";
import type { LocalAgentRecord } from "./local-store";
export type LocalCompactionSettingsRecord = Record<string, unknown>;
export interface ResolvedLocalCompactionSettings {
    mode: LocalCompactionMode;
    prompt?: string | null;
    clipChars?: number | null;
    slidingWindowPercentage: number;
}
export declare function compactionSettingsRecord(value: unknown): LocalCompactionSettingsRecord | null | undefined;
export declare function localCompactionMode(value: unknown): LocalCompactionMode | undefined;
export declare function validateLocalCompactionSettingsRecord(settings: LocalCompactionSettingsRecord): void;
export declare function localCompactionSettingsForStorage(settings: LocalCompactionSettingsRecord | null | undefined): LocalCompactionSettingsRecord | null | undefined;
/**
 * Merge a compaction-settings patch into the record already stored on the agent.
 *
 * `updateAgent` is a PATCH: a writer may send only the field it changed (the
 * `/compaction` overlay reports just what the user edited, and an agent editing
 * settings through the self-configuration skill does the same). Writing the
 * patch wholesale would silently drop the compaction model, the summary prompt
 * and the compression rate — the same defect B-1 fixed for conversation-level
 * `model_settings`.
 *
 * A `null` patch still means "clear the record": merging and clearing are two
 * different requests, and only the caller knows which one it made.
 */
export declare function mergeLocalCompactionSettings(current: LocalCompactionSettingsRecord | null | undefined, patch: LocalCompactionSettingsRecord | null): LocalCompactionSettingsRecord | null;
/** The settings one compaction run uses, with request values winning. */
export declare function resolveLocalCompactionSettings(agent: LocalAgentRecord, body?: ConversationMessageCompactBody): ResolvedLocalCompactionSettings;
//# sourceMappingURL=local-compaction-settings.d.ts.map