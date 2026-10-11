import type { LocalAgentRecord } from "./local-types";
/**
 * Why a prefix snapshot was (re)applied. Stamped by {@link compileLocalSystemPrompt}
 * callers at an application point (see `prefix-freeze.ts`).
 */
export type LocalFreezeReason = "conversation_created" | "compaction" | "manual_recompile" | "fork_inherited";
export interface LocalCompiledSystemPrompt {
    content: string;
    coreMemory: string;
    compiledAt: string;
    /**
     * Hash of the `agent.system` template only — it does NOT cover the compiled
     * prompt, nor the core memory injected into it. Core-memory changes are
     * tracked by `memfsRevision`, not by this hash.
     */
    systemTemplateHash: string;
    memfsRevision?: string;
    /** Prefix-freeze snapshot marker; absent means "not frozen yet". */
    freezeSchema?: 1;
    /** Frozen skills text; absent means "skills not frozen yet". */
    frozenSkillsBlock?: string;
    /** Frozen `client_tools` declaration set (canonical JSON, byte-stable). */
    frozenTools?: string;
    frozenModel?: string;
    /** Frozen `model_settings` (canonical JSON). */
    frozenModelSettings?: string;
    frozenAt?: string;
    frozenReason?: LocalFreezeReason;
    /**
     * Last live values observed at a turn that differed from the frozen ones.
     * Reporting-only (feeds `/context-pending`); never used to build a request.
     */
    observedSkillsBlock?: string;
    observedTools?: string;
}
export interface CompileLocalSystemPromptOptions {
    agent: LocalAgentRecord;
    conversationId: string;
    memoryDir?: string;
    includeMemfs?: boolean;
    /**
     * Append the topic-marking chapter. Defaults to on; the caller passes
     * `topic_marking_enabled`, and the chapter lives in the frozen prefix so the
     * switch takes effect at the next application point.
     */
    includeTopicMarking?: boolean;
    now?: Date;
    previousMessageCount?: number;
}
export declare function hashRawSystemPrompt(systemPrompt: string): string;
export declare function getCommittedMemfsRevision(memoryDir: string): string | undefined;
export declare function compileAvailableSkillsBlock(clientSkills?: unknown[]): string;
/**
 * Append an already-compiled skills block. Under prefix freeze the block itself
 * is frozen (see `prefix-freeze.ts`), so the turn path appends the stored text
 * instead of recompiling it from the live `client_skills`.
 */
export declare function appendCompiledSkillsBlock(systemPrompt: string, skillsBlock: string | undefined): string;
export declare function appendAvailableSkillsBlock(systemPrompt: string, clientSkills?: unknown[]): string;
export declare function compileLocalSystemPrompt(options: CompileLocalSystemPromptOptions): LocalCompiledSystemPrompt;
//# sourceMappingURL=system-prompt-compilation.d.ts.map