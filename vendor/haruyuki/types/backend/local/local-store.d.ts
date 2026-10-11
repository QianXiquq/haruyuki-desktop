import type { AgentState } from "@letta-ai/letta-client/resources/agents/agents";
import type { LettaStreamingResponse } from "@letta-ai/letta-client/resources/agents/messages";
import type { Conversation } from "@letta-ai/letta-client/resources/conversations/conversations";
import type { AgentCreateBody, AgentListBody, AgentMessageListBody, AgentUpdateBody, ConversationCreateBody, ConversationListBody, ConversationMessageCreateBody, ConversationMessageListBody, ConversationMessageStreamBody, ConversationUpdateBody } from "../backend";
import { LocalContextRewrites } from "./local-context-rewrite";
import { type LocalMessage } from "./local-message";
import type { LocalAgentRecord, StoredConversation, StoredMessage } from "./local-types";
import type { LocalCompiledSystemPrompt } from "./system-prompt-compilation";
export type { LocalAgentRecord, StoredMessage };
/**
 * Resident floor per conversation on disk-backed stores: the window always
 * holds every in-context message, and messages that left the context are only
 * evicted beyond this many. Doubles the cloud BACKFILL_PAGE_LIMIT (50).
 */
export declare const DEFAULT_RESIDENT_MESSAGE_TAIL_LIMIT = 100;
export interface StoredTurnInput {
    agentId: string;
    conversationId: string;
}
export interface LocalStoreOptions {
    storageDir?: string;
    seedDefaultAgent?: boolean;
    strictAgentAccess?: boolean;
    strictConversationAccess?: boolean;
    defaultAgentName?: string;
    defaultAgentModel?: string;
    defaultAgentModelSettings?: Record<string, unknown>;
    modelSettingsForModel?: (model: string) => Record<string, unknown> | undefined;
    conversationIdPrefix?: string;
    storedMessageIdPrefix?: string;
    localMessageIdPrefix?: string;
    /**
     * Resident floor for disk-backed stores; in-memory stores keep the full
     * transcript resident (no disk to page from).
     */
    residentMessageTailLimit?: number;
}
export declare class LocalBackendNotFoundError extends Error {
    readonly status = 404;
    constructor(resource: string, id: string);
}
export declare class LocalStore {
    private readonly defaultAgentId;
    private readonly storageDir?;
    private readonly strictAgentAccess;
    private readonly strictConversationAccess;
    private readonly defaultAgentName;
    private readonly defaultAgentModel;
    private readonly defaultAgentModelSettings;
    private readonly modelSettingsForModel?;
    private readonly conversationIdPrefix;
    private readonly storedMessageIdPrefix;
    private readonly localMessageIdPrefix;
    private readonly agents;
    private readonly agentRecordMtimeMsById;
    private readonly conversations;
    private readonly localMessagesByConversationKey;
    private readonly loadedConversationKeys;
    private readonly tailResidentConversationKeys;
    private readonly residentTailStartIndexByConversationKey;
    private readonly residentMessageTailLimit;
    private readonly loadRepairedConversationKeys;
    private localContextRewrites?;
    private readonly unreadTranscriptHeadBytesByKey;
    private readonly transcriptMetadataByConversationKey;
    private readonly conversationRecordJsonByKey;
    private readonly sessionEntryIdsByConversationKey;
    private readonly sessionEntryIdByMessageIdByConversationKey;
    private readonly persistedMessageByMessageIdByConversationKey;
    private readonly lastSessionEntryIdByConversationKey;
    private readonly compiledSystemPromptByConversationKey;
    private readonly messagesById;
    private readonly settledLocalMessageIds;
    private conversationRecordsScanned;
    private conversationSeq;
    private messageSeq;
    private localMessageSeq;
    constructor(defaultAgentId: string, options?: LocalStoreOptions);
    retrieveAgent(agentId: string): AgentState;
    listAgents(body?: AgentListBody): {
        items: AgentState[];
    };
    deleteAgent(agentId: string): void;
    retrieveAgentRecord(agentId: string): LocalAgentRecord;
    ensureAgent(agentId: string): AgentState;
    updateAgent(agentId: string, body: AgentUpdateBody): AgentState;
    setAgentCompactionSettings(agentId: string, settings: Record<string, unknown> | null): AgentState;
    createAgent(body: AgentCreateBody): AgentState;
    private createDefaultAgentRecord;
    private createAgentRecord;
    private modelSettingsDefaultsForModel;
    private projectableAgentRecord;
    retrieveConversation(conversationId: string, agentId?: string): Conversation;
    retrievePublicConversation(conversationId: string, agentId?: string): Conversation;
    listConversations(body?: ConversationListBody): Conversation[];
    createConversation(body: ConversationCreateBody): Conversation;
    createEphemeralConversation(body: {
        model: string;
        system: string;
        model_settings?: Record<string, unknown>;
        context_window_limit?: number | null;
        parent_agent_id?: string | null;
        name?: string;
        is_subagent?: boolean;
    }): StoredConversation;
    isAgentFreeConversation(conversationId: string): boolean;
    retrieveExecutionAgentRecord(conversationId: string, agentId: string): LocalAgentRecord;
    updateConversation(conversationId: string, body: ConversationUpdateBody): Conversation;
    private withConversationModelDefaults;
    forkConversation(conversationId: string, options?: {
        agentId?: string;
        hidden?: boolean;
        messageId?: string;
    }): {
        id: string;
    };
    appendTurnInput(conversationId: string, body: ConversationMessageCreateBody | ConversationMessageStreamBody): StoredTurnInput;
    appendStreamChunk(conversationId: string, agentId: string, chunk: LettaStreamingResponse): LettaStreamingResponse;
    listLocalMessages(conversationId: string, agentId?: string): LocalMessage[];
    settleInterruptedToolCalls(conversationIdOrAgentId: string, options?: {
        agentId?: string;
        reason?: string;
    }): number;
    resolveAgentIdForConversation(conversationId: string): string;
    getCompiledSystemPrompt(conversationId: string, agentId: string): LocalCompiledSystemPrompt | undefined;
    setCompiledSystemPrompt(conversationId: string, agentId: string, prompt: LocalCompiledSystemPrompt): void;
    listConversationMessages(conversationId: string, body?: ConversationMessageListBody): StoredMessage[];
    listAgentMessages(agentId: string, body?: AgentMessageListBody): StoredMessage[];
    retrieveMessage(messageId: string): StoredMessage[];
    private appendUserLocalMessage;
    private applyVisibleChunkToLocalMessages;
    private applyFinalAssistantMessage;
    private appendAssistantText;
    private appendAssistantReasoning;
    private appendAssistantToolCall;
    private toolResultContentFromUnknown;
    private findToolResult;
    private appendToolResultMessage;
    private applyApprovalResults;
    private settleInterruptedToolCallsForConversation;
    private rollbackUnpersistedTrailingAssistantMessage;
    private findToolCall;
    private assistantLocalMessageForAppend;
    private touchLocalMessage;
    private toolCallFromChunk;
    private createStoredChunk;
    private applyListOptions;
    private projectLocalMessages;
    /**
     * Index only the projections of the message matching messageId within a
     * paged list, so deep retrieveMessage scans never pin a whole transcript.
     */
    private indexMatchingMessageInList;
    private projectTailMessagesForConversation;
    private projectedMessagesForConversation;
    private rebuildMessageIndex;
    private loadConversationContainingMessage;
    /**
     * Page the full transcript from disk and index only the retrieved
     * message; nothing stays resident.
     */
    private indexMessageFromConversationFullRead;
    private indexMessageFromTranscriptTail;
    private indexMessageFromConversationTail;
    /**
     * Full logical message list for readers that need the whole history
     * (executor, compaction, fork, export). Serves from the resident array
     * when fully resident, else pages disk and merges the resident tail.
     * Fresh array; mutation paths use residentLocalMessagesForConversation.
     */
    private localMessagesForConversation;
    /**
     * The live resident message window for mutation paths (append, rollback,
     * tool settlement, approval application, streaming chunk application).
     * In-context window on disk-backed stores; appends mirror to the transcript.
     */
    private residentLocalMessagesForConversation;
    /**
     * Read and normalize the full transcript from disk without changing
     * message residency; undefined when there is no transcript metadata.
     */
    private readConversationMessagesFromDisk;
    private markConversationFullyResident;
    private markNewConversationResident;
    /**
     * Full load: the entire parsed transcript becomes resident (legacy format,
     * synthetic timestamp repair, in-memory stores).
     */
    private loadConversationMessages;
    /**
     * Tail load: the transcript suffix holding every in-context message becomes
     * the resident window; append dedup, parent chaining, and rollback
     * detection only consult it.
     */
    private loadConversationMessageTail;
    /**
     * Replace the resident window after a wholesale in-memory rewrite
     * (compaction); the caller's persist appends the rewrite entry to disk.
     */
    private setResidentConversationMessages;
    /** Drop a fully resident conversation back to its bounded tail window. */
    private demoteConversationToResidentTail;
    /** Evict out-of-context messages (still on disk) beyond the resident floor. */
    private trimResidentConversationTail;
    private evictResidentHeadMessages;
    private pushLocalMessage;
    private validateUnreadTranscriptHeadOnce;
    private persistPendingAssistantMessage;
    private touchConversationForLocalMessage;
    private cloneLocalMessageForConversation;
    private localContentFromInputContent;
    private nextLocalMessageId;
    private nextLocalMessageDate;
    private currentLocalMessageDate;
    private setTranscriptMetadata;
    private transcriptMetadataRecord;
    private validateTranscriptMetadata;
    private conversationsDir;
    private conversationDirForKey;
    private conversationMessagesPath;
    /**
     * The context-rewrite surface: topic markers plus the single "history became
     * a summary" write path. Built lazily so the ports close over a fully
     * constructed store.
     */
    get contextRewrites(): LocalContextRewrites;
    private recordSessionEntryId;
    private updateConversationSequences;
    private cacheConversationRecord;
    private loadConversationRecordFromDir;
    private refreshConversationRecordFromStorage;
    private loadConversationRecordsFromStorage;
    private refreshLoadedConversationRecordsFromStorage;
    private loadFromStorage;
    private persistAgent;
    private agentRecordFileMtimeMs;
    private recordAgentRecordMtime;
    private refreshAgentRecordFromStorage;
    private refreshLoadedAgentRecordsFromStorage;
    private projectAgent;
    private persistConversationState;
    private persistConversationTranscript;
    private rewriteConversationSessionTranscript;
    /**
     * Append a `message` row, skipping it when the same snapshot is already
     * persisted under the same entry.
     */
    private appendConversationSessionMessageEntry;
    private appendConversationSessionCompactionEntry;
    private appendConversationSessionEntry;
    private ensureConversationTranscriptHeader;
    private resetPersistedSessionState;
    private resetPersistedSessionStateFromEntries;
    private sessionEntryIds;
    private sessionEntryIdsByMessageId;
    private persistedMessagesByMessageId;
    private nextSessionEntryId;
    private persistCompiledSystemPrompt;
    private ensureConversation;
    private nextConversationId;
    private findConversation;
    private toolSettlementTargets;
    private executionAgentIdForConversation;
    private agentIdForConversation;
    private conversationKey;
}
//# sourceMappingURL=local-store.d.ts.map