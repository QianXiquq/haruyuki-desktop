/** Browser-safe question receipts and user-message notifications. */
export interface AskUserQuestion {
    question: string;
    header: string;
    options: Array<{
        label: string;
        description: string;
    }>;
    multiSelect?: boolean;
}
export interface AskUserQuestionReceipt {
    type: "ask_user_question";
    version: 2;
    toolCallId: string;
    questions: AskUserQuestion[];
}
export interface AskUserQuestionResponse {
    type: "ask_user_question_response";
    version: 2;
    toolCallId: string;
    questions: AskUserQuestion[];
    status: "answered" | "dismissed";
    answers?: Record<string, string>;
}
export declare function isAskUserQuestions(value: unknown): value is AskUserQuestion[];
export declare function parseAskUserQuestionReceipt(value: unknown): AskUserQuestionReceipt | null;
/** Return content for a user-role message submitted through normal message delivery. */
export declare function prepareAskUserQuestionNotif(response: AskUserQuestionResponse): string;
/** Match only complete notifications; queued messages may coalesce several together. */
export declare function parseAskUserQuestionNotif(text: string): AskUserQuestionResponse[];
//# sourceMappingURL=ask-user-question.d.ts.map