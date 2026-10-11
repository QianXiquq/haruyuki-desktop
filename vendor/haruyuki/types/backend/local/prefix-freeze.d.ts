import type { LocalAgentRecord } from "./local-store";
import { type LocalCompiledSystemPrompt, type LocalFreezeReason } from "./system-prompt-compilation";
/**
 * Deterministic JSON: object keys sorted recursively so the same declaration set
 * serializes to the same bytes regardless of key insertion order. Prefix
 * stability depends on this, not just on set equality.
 */
export declare function canonicalJson(value: unknown): string;
/**
 * Stamp application-point freeze metadata onto a freshly compiled snapshot.
 * The compiled snapshot carries no frozen collections, so tools/skills stay
 * "unfrozen" here and are re-established from the next turn's live set — which
 * is exactly "apply the latest live collections".
 */
export declare function stampFreezeMetadata(compiled: LocalCompiledSystemPrompt, input: {
    reason: LocalFreezeReason;
    agent: Pick<LocalAgentRecord, "model" | "model_settings">;
    now?: Date;
}): LocalCompiledSystemPrompt;
/**
 * Establish (once, from the first non-empty live set) and observe the frozen
 * collections. `changed` reports whether the persisted snapshot must be
 * rewritten: a collection was just frozen, a live value differing from the
 * frozen one was observed, or an earlier observation no longer differs.
 *
 * The live values are always computed, so "the client stopped sending tools"
 * is an observation (an empty set) rather than an absence of information. An
 * observation that matches the frozen value is CLEARED: otherwise `/context-pending`
 * would keep reporting drift that has since reverted.
 */
export declare function establishFrozenCollections(input: {
    snapshot: LocalCompiledSystemPrompt;
    skillsBlock: string;
    tools: unknown[];
}): {
    snapshot: LocalCompiledSystemPrompt;
    changed: boolean;
};
export interface FrozenTurnPrefix {
    systemPrompt: string;
    agent: LocalAgentRecord;
    clientTools?: unknown[];
    snapshot: LocalCompiledSystemPrompt;
    /** True when the persisted snapshot must be rewritten (freeze/observe). */
    changed: boolean;
}
/**
 * Assemble the turn prefix from the applied snapshot: append the frozen skills
 * block, overlay the frozen model/params, and hand back the frozen tool set.
 * Establishes the collections on the first turn that carries a non-empty set.
 */
export declare function assembleFrozenTurnPrefix(input: {
    snapshot: LocalCompiledSystemPrompt;
    liveAgent: LocalAgentRecord;
    clientSkills: unknown[];
    clientTools: unknown[];
}): FrozenTurnPrefix;
/** The frozen tool declaration set, or `undefined` when tools are not frozen yet
 * (so the caller falls back to the request body's live `client_tools`).
 */
export declare function frozenToolsArray(snapshot: LocalCompiledSystemPrompt): unknown[] | undefined;
/** Overlay the frozen model/params so a live `/model` switch does not take effect. */
export declare function applyFrozenAgentOverrides<T extends Pick<LocalAgentRecord, "model" | "model_settings">>(agent: T, snapshot: LocalCompiledSystemPrompt): T;
export interface ContextPendingMemory {
    appliedRevision?: string;
    committedRevision?: string;
    /**
     * Whether the committed revision could actually be read. `false` means the
     * memory repo is missing or unreadable, so the memory delta is UNKNOWN rather
     * than empty — the caller must say so instead of reporting "no changes".
     * `undefined` means memory is not in play at all (memfs disabled).
     */
    reachable?: boolean;
    /** `git log --oneline <applied>..<committed>` entries. */
    unappliedCommits: string[];
    diffStat: string;
    fullDiff?: string;
}
export interface ContextPendingToolsDiff {
    applied?: string;
    observed?: string;
    added: string[];
    removed: string[];
    changed: boolean;
}
export interface ContextPendingReport {
    hasSnapshot: boolean;
    memory: ContextPendingMemory;
    systemChanged: boolean;
    skillsChanged: boolean;
    tools: ContextPendingToolsDiff;
    model: {
        applied?: string;
        live?: string;
        changed: boolean;
    };
    modelSettingsChanged: boolean;
    dirty: boolean;
    hasPending: boolean;
}
export interface ComputeContextPendingInput {
    hasSnapshot: boolean;
    appliedRevision?: string;
    committedRevision?: string;
    memoryReachable?: boolean;
    unappliedCommits?: string[];
    diffStat?: string;
    fullDiff?: string;
    appliedRawSystemHash?: string;
    liveRawSystemHash?: string;
    appliedSkillsBlock?: string;
    observedSkillsBlock?: string;
    appliedTools?: string;
    observedTools?: string;
    appliedModel?: string;
    liveModel?: string;
    appliedModelSettings?: string;
    liveModelSettings?: string;
    dirty: boolean;
}
export declare function computeContextPending(input: ComputeContextPendingInput): ContextPendingReport;
/**
 * Assemble the pending report from already-gathered live data. The caller owns
 * I/O (git, store); this keeps the backend orchestration thin (D-009).
 */
export declare function buildContextPendingReport(input: {
    snapshot: LocalCompiledSystemPrompt | undefined;
    liveAgent: Pick<LocalAgentRecord, "system" | "model" | "model_settings">;
    memory: ContextPendingMemory;
    dirty: boolean;
}): ContextPendingReport;
/**
 * Uncommitted working-tree changes in the memory repo. Deliberately NOT part of
 * `hasPending`: they are not applied until committed (requirement §3.1, §5).
 */
export declare function isMemoryDirDirty(memoryDir: string): boolean;
/**
 * Read the committed-vs-applied memory delta straight from git. Best effort: a
 * missing repo or unreachable revision yields an empty delta rather than
 * throwing, because the caller must never rewrite the prefix on error. The
 * `reachable` flag records that the delta is UNKNOWN, so the report can say so
 * instead of claiming there is nothing pending.
 */
export declare function collectMemoryPending(memoryDir: string, appliedRevision: string | undefined, options?: {
    full?: boolean;
}): ContextPendingMemory;
//# sourceMappingURL=prefix-freeze.d.ts.map