import type { LoopStatus, StopReasonType } from "../../types/protocol_v2";
export type ActiveTurnLoopStatus = Exclude<LoopStatus, "WAITING_ON_INPUT" | "EXECUTING_COMMAND">;
export type TurnOrigin = "message" | "approval_recovery";
export type TurnLease = Readonly<{
    id: string;
    signal: AbortSignal;
}>;
type IdleTurnState = {
    kind: "idle";
    loopStatus: "WAITING_ON_INPUT";
};
type CommandTurnState = {
    kind: "command";
    loopStatus: "EXECUTING_COMMAND";
};
type ActiveTurnState = {
    kind: "active";
    origin: TurnOrigin;
    lease: TurnLease;
    abortController: AbortController;
    loopStatus: ActiveTurnLoopStatus;
    workingDirectory: string;
    runId: string | null;
    executingToolCallIds: readonly string[];
};
type CancellingTurnState = {
    kind: "cancelling";
    origin: TurnOrigin;
    lease: TurnLease;
    abortController: AbortController;
    runId: string | null;
    executingToolCallIds: readonly string[];
    loopStatus: "WAITING_ON_INPUT";
    ownerFinished: boolean;
    externalSettlementPending: boolean;
};
type TurnState = IdleTurnState | CommandTurnState | ActiveTurnState | CancellingTurnState;
export type TurnLifecycleSnapshot = IdleTurnState | CommandTurnState | Omit<ActiveTurnState, "abortController"> | Omit<CancellingTurnState, "abortController" | "ownerFinished" | "externalSettlementPending">;
export type TurnCancellationTransition = {
    transitioned: boolean;
    lease: TurnLease | null;
    runId: string | null;
    executingToolCallIds: readonly string[];
};
export type TurnCancellationSettlementTransition = {
    settled: boolean;
    released: boolean;
};
export type TurnFinishTransition = {
    finished: boolean;
    previousKind: "active" | "cancelling" | null;
    runId: string | null;
};
export declare class TurnLifecycle {
    #private;
    constructor(createId?: () => string);
    get kind(): TurnState["kind"];
    get isProcessing(): boolean;
    get cancelRequested(): boolean;
    get loopStatus(): LoopStatus;
    get activeWorkingDirectory(): string | null;
    get activeRunId(): string | null;
    get executingToolCallIds(): readonly string[];
    get lastStopReason(): StopReasonType | null;
    get currentLease(): TurnLease | null;
    snapshot(): TurnLifecycleSnapshot;
    begin(options: {
        origin: TurnOrigin;
        workingDirectory: string;
        initialStatus?: ActiveTurnLoopStatus;
        abortController?: AbortController;
        executingToolCallIds?: readonly string[];
    }): TurnLease;
    isCurrent(lease: TurnLease): boolean;
    setStatus(lease: TurnLease, status: ActiveTurnLoopStatus): boolean;
    setRunId(lease: TurnLease, runId: string | null): boolean;
    setExecutingToolCallIds(lease: TurnLease, toolCallIds: readonly string[]): boolean;
    recordStopReason(lease: TurnLease, stopReason: StopReasonType): boolean;
    startCommand(): boolean;
    finishCommand(): boolean;
    requestCancellation(options?: {
        waitForExternalSettlement?: boolean;
    }): TurnCancellationTransition;
    finish(lease: TurnLease, stopReason: StopReasonType): TurnFinishTransition;
    settleCancellation(lease: TurnLease): TurnCancellationSettlementTransition;
    reset(stopReason?: StopReasonType): TurnFinishTransition;
}
export {};
//# sourceMappingURL=turn-lifecycle.d.ts.map