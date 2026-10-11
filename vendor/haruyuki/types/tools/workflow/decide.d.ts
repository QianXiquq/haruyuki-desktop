type RecordValue = Record<string, unknown>;
export interface DecisionRequest {
    state: string | RecordValue | unknown[];
    questions: RecordValue;
    provider?: RecordValue;
    session_id?: string;
    trace?: RecordValue;
    user?: string;
}
export interface DecisionResponse {
    model: string;
    answers: Record<string, RecordValue & {
        calibrated: true;
    }>;
    usage: {
        input_tokens: number;
        output_tokens: number;
        cost: number;
    };
    id: string;
    provider: string;
}
/** Submit one typed Jev decision; only an invalid answer is retried once. */
export declare function submitWorkflowDecision(input: unknown, signal: AbortSignal, onResult?: (result: {
    model: string;
    cost?: number;
    calibrated: boolean;
    valid: boolean;
    totalTokens: number;
}) => void): Promise<DecisionResponse | null>;
export {};
//# sourceMappingURL=decide.d.ts.map