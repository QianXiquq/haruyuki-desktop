import { type AskUserQuestion, type AskUserQuestionReceipt } from "../../ask-user-question";
export declare function ask_user_question_async(args: {
    questions: AskUserQuestion[];
    toolCallId: string;
}): Promise<AskUserQuestionReceipt & {
    message: string;
}>;
//# sourceMappingURL=ask-user-question.d.ts.map