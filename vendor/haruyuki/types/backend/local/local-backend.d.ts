import type { Backend, BackendCapabilities, ConversationCreateBody, ConversationMessageCompactBody, ConversationMessageCreateBody, ConversationMessageStreamBody, ConversationRecompileBody } from "../backend";
import { HeadlessBackend, type ResolvedTurnPrefix } from "../dev/headless-backend";
import type { HeadlessTurnExecutor } from "../dev/headless-turn-executor";
import { LocalPiModelsRuntime } from "../dev/pi-models-runtime";
import type { PiStreamFunction } from "../dev/pi-stream-adapter";
import type { LlmEndInfo, LlmStartInfo } from "../dev/provider-turn-executor";
import { type LocalCompleteFunction } from "./compaction";
import type { LocalTopicMarkerAppendResult } from "./local-context-rewrite";
import { type LocalBackendExecutionMode } from "./local-executor-factory";
import type { LocalMessage } from "./local-message";
import type { LocalAgentRecord, StoredMessage } from "./local-store";
import { type LocalTopicList, type LocalTopicTrimOutcome, type LocalTopicTrimPick } from "./local-topic-trim";
import { type ContextPendingReport } from "./prefix-freeze";
import type { LocalTopicMarker } from "./topic-compaction";
import { type TopicNudgeDecision } from "./topic-compaction";
export interface LocalBackendOptions {
    storageDir: string;
    stateStorageDir?: string;
    defaultAgentId?: string;
    executionMode?: LocalBackendExecutionMode;
    executor?: HeadlessTurnExecutor;
    stream?: PiStreamFunction;
    complete?: LocalCompleteFunction;
    memoryDir?: string;
    memfsEnabled?: boolean;
    modelsRuntime?: LocalPiModelsRuntime;
}
/**
 * Hooks the harness installs (via {@link LocalBackend.setModEventHooks}) so
 * mods can observe backend-internal lifecycle that only the local backend owns
 * (compaction and provider calls). The backend stays mod-agnostic: it invokes
 * these plain callbacks and never touches mod state.
 */
export interface LocalBackendModEventHooks {
    onCompactStart?: (info: {
        agentId: string;
        conversationId: string;
        trigger: string;
    }) => void | Promise<void>;
    onCompactEnd?: (info: {
        agentId: string;
        conversationId: string;
        trigger: string;
        messagesBefore: number;
        messagesAfter: number;
        contextTokensBefore: number;
        contextTokensAfter: number;
    }) => void | Promise<void>;
    onLlmStart?: (info: LlmStartInfo) => void | Promise<void>;
    onLlmEnd?: (info: LlmEndInfo) => void | Promise<void>;
}
export declare class LocalBackend extends HeadlessBackend {
    readonly capabilities: BackendCapabilities;
    private readonly memoryDir?;
    private readonly storageDir;
    private readonly piModelsRuntime;
    private readonly complete?;
    private readonly memfsEnabledOverride?;
    private modEventHooks?;
    constructor(options: LocalBackendOptions);
    /**
     * Late-bound because the backend is a process-global singleton constructed
     * before the harness mod adapter exists. The harness calls this once the
     * registry is ready to forward backend-internal events to local mods.
     */
    setModEventHooks(hooks: LocalBackendModEventHooks | undefined): void;
    private emitCompactStart;
    private emitCompactEnd;
    private emitLlmStart;
    private emitLlmEnd;
    getLocalStorageDir(): string;
    listModels(): Promise<never>;
    createAgent(...args: Parameters<HeadlessBackend["createAgent"]>): Promise<import("@letta-ai/letta-client/resources/index.mjs").AgentState>;
    /**
     * Fork a conversation, carrying its topic markers across.
     *
     * The store clones messages with fresh ids, so a marker's anchor has to be
     * remapped onto the child's copy. Both sides' in-context lists are read before
     * and after the fork: the child is a prefix of the parent (a cutoff fork keeps
     * fewer messages), which is exactly the positional mapping the anchors need.
     */
    forkConversation(...args: Parameters<HeadlessBackend["forkConversation"]>): ReturnType<HeadlessBackend["forkConversation"]>;
    updateAgent(...args: Parameters<HeadlessBackend["updateAgent"]>): Promise<import("@letta-ai/letta-client/resources/index.mjs").AgentState>;
    createConversation(body: ConversationCreateBody): ReturnType<HeadlessBackend["createConversation"]>;
    createEphemeralConversation(body: {
        model: string;
        system: string;
        model_settings?: Record<string, unknown>;
        context_window_limit?: number | null;
        parent_agent_id?: string | null;
        name?: string;
        is_subagent?: boolean;
    }): Promise<Awaited<ReturnType<NonNullable<Backend["createEphemeralConversation"]>>>>;
    recompileConversation(conversationId: string, body?: ConversationRecompileBody): Promise<string>;
    compactConversationMessages(conversationId: string, body?: ConversationMessageCompactBody): ReturnType<Backend["compactConversationMessages"]>;
    /**
     * Local-only: describe the prefix changes that are registered but not yet
     * applied, for the `/context-pending` command. Read-only — never rewrites the
     * frozen prefix (requirement §6, `buildContextPendingReport`).
     */
    getContextPending(conversationId: string, agentId: string, options?: {
        full?: boolean;
    }): Promise<ContextPendingReport>;
    /**
     * Local-only: append a topic marker to the conversation transcript.
     *
     * A marker is metadata — the context, the in-context id list, and the frozen
     * prefix are all untouched, so `TopicMark` / `/topic` can never invalidate the
     * provider cache. The anchor is the newest in-context message at write time;
     * `contextMessageCount === 0` means there was nothing to anchor to and the
     * caller must refuse the mark.
     */
    markTopic(input: {
        conversationId: string;
        agentId?: string;
        title: string;
        summary?: string;
        createdBy: "agent" | "user";
    }): LocalTopicMarkerAppendResult;
    /** Local-only: every marker in the transcript, oldest first. */
    listTopicMarkers(conversationId: string, agentId?: string): LocalTopicMarker[];
    /**
     * Local-only: the facts the marker frequency gate reads *before* writing.
     *
     * `markTopic` reports `turnsSincePrevious` too, but only after the row exists
     * — a gate that rejects has to decide first, so the same numbers must be
     * derivable without mutating anything.
     */
    topicMarkerState(conversationId: string, agentId?: string): {
        markers: LocalTopicMarker[];
        turnsSinceLastMarker: number;
        contextMessageCount: number;
        /** Anchor a fresh marker would get; `null` for an empty context (L-6). */
        latestMessageId: string | null;
    };
    /**
     * Local-only: decide the one-shot no-marker nudge (D-114) and settle its flag
     * in the same call. Read the decision's `reason` for why it did not fire.
     */
    consumeTopicNudge(conversationId: string, agentId?: string): TopicNudgeDecision;
    /**
     * Local-only: the topic blocks of the current context, cut at each marker's
     * *effective* boundary, plus every marker in the transcript for
     * `/topics --all`. Read-only — a list never rewrites anything.
     */
    listTopics(conversationId: string, agentId?: string, options?: {
        rewindTurns?: number;
    }): LocalTopicList;
    /**
     * Local-only: summarize everything before a user-picked boundary and keep the
     * rest. This is the *only* path that may trim context on a user's behalf; it
     * returns `executed: false` (having written nothing) when the pick cannot be
     * honored.
     */
    trimConversationToTopic(input: {
        conversationId: string;
        agentId?: string;
        pick: LocalTopicTrimPick;
        rewindTurns?: number;
        trigger?: string;
    }): Promise<LocalTopicTrimOutcome>;
    private topicTrimPorts;
    protected resolveSystemPromptForTurn(input: {
        conversationId: string;
        agentId: string;
        agent: LocalAgentRecord;
        body: ConversationMessageCreateBody | ConversationMessageStreamBody;
        history: StoredMessage[];
        uiMessages: LocalMessage[];
    }): Promise<ResolvedTurnPrefix>;
    private memoryDirForAgent;
    private isLocalMemfsEnabled;
    private ensureLocalMemoryRepo;
    private effectiveContextWindow;
    /**
     * Resolve the model that compaction should use for a conversation.
     *
     * A normal turn runs on the conversation's model override (set via `/model`),
     * but compaction previously read only the agent's base model — so switching
     * a conversation's model never changed which model compaction (and its
     * summarizer) used. This overlays the conversation's `model` / `model_settings`
     * onto the agent record so compaction mirrors the turn path.
     */
    private effectiveAgentForConversation;
    /**
     * The agent a compaction should run as: the live record, overlaid with the
     * model the frozen prefix pinned, so a pending `/model` switch only takes
     * effect after the rewrite completes (requirement §6).
     */
    private frozenAgentForConversation;
    private compactLocalConversation;
    private compactLocalConversationInner;
    private compactLocalConversationSlidingWindow;
    private getOrCompileSystemPrompt;
    private compileAndMaybePersistSystemPrompt;
}
//# sourceMappingURL=local-backend.d.ts.map