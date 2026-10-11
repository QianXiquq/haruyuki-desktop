import type { ChildProcessWithoutNullStreams } from "node:child_process";
import type { SubagentResult } from "../../agent/subagents";
export interface ClaudeSessionTransport {
    process: Pick<ChildProcessWithoutNullStreams, "stdout" | "stderr" | "stdin">;
    completion: Promise<{
        exitCode: number | null;
        exitSignal: NodeJS.Signals | null;
    }>;
    wasAborted(): boolean;
}
export interface ClaudeTurnOptions {
    prompt: string;
    parentAgentId: string;
    cwd: string;
    model?: string;
    mcpReminder?: string;
    signal?: AbortSignal;
    resumeSessionId?: string;
    sessionId?: string;
    onStarted?: (sessionId: string) => void;
}
export interface ClaudeMessageReceipt {
    mode: "steered" | "resumed";
    sessionId: string;
    completion?: Promise<SubagentResult>;
    interrupt?: () => Promise<void>;
}
export interface ClaudeSessionDependencies {
    createTransport?: (options: {
        args: string[];
        cwd: string;
        env: NodeJS.ProcessEnv;
        signal?: AbortSignal;
    }) => ClaudeSessionTransport;
    env?: NodeJS.ProcessEnv;
    createSessionId?: () => string;
}
export declare function buildClaudeStreamArgs(options: {
    model?: string;
    mcpReminder?: string;
    resumeSessionId?: string;
    sessionId?: string;
}): string[];
export declare function runClaudeTurn(options: ClaudeTurnOptions, deps?: ClaudeSessionDependencies): Promise<SubagentResult>;
export declare function sendClaudeMessage(options: Omit<ClaudeTurnOptions, "resumeSessionId" | "sessionId" | "onStarted"> & {
    sessionId: string;
}, deps?: ClaudeSessionDependencies): Promise<ClaudeMessageReceipt>;
export declare function hasActiveClaudeTurn(sessionId: string): boolean;
export declare function __resetClaudeSessionsForTests(): void;
//# sourceMappingURL=claude-stream-session.d.ts.map