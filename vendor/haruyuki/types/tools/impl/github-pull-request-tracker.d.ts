import { type ConversationUpdateBody } from "../../backend";
export type ShellSourceCommand = string | readonly string[];
type OutputStream = "stdout" | "stderr";
export type ConversationTagBackend = {
    retrieveConversation(conversationId: string, options?: {
        signal?: AbortSignal;
    }): Promise<unknown>;
    updateConversation(conversationId: string, body: ConversationUpdateBody, options?: {
        signal?: AbortSignal;
    }): Promise<unknown>;
};
export interface GitHubPullRequestOutputTracker {
    append(text: string, stream: OutputStream): void;
    finish(): Promise<void>;
}
export declare function isGitHubPullRequestCreateCommand(command: ShellSourceCommand): boolean;
/** Copy PRs opened in an Agent conversation onto its launching conversation. */
export declare function copyGitHubPullRequestTags(sourceConversationId: string | undefined, targetConversationId: string | undefined, backend?: ConversationTagBackend, signal?: AbortSignal): Promise<void>;
export declare function createGitHubPullRequestOutputTracker(command: ShellSourceCommand, options?: {
    conversationId?: string;
    backend?: ConversationTagBackend;
}): GitHubPullRequestOutputTracker | undefined;
export {};
//# sourceMappingURL=github-pull-request-tracker.d.ts.map