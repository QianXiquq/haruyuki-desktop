import type { Readable, Writable } from "node:stream";
import type { SubagentResult } from "../../agent/subagents";
export interface CodexAppServerTransport {
    stdout: Readable;
    stderr?: Readable;
    stdin: Writable;
    kill?: () => void;
}
export interface CodexTurnOptions {
    prompt: string;
    parentAgentId: string;
    cwd: string;
    model?: string;
    mcpReminder?: string;
    signal?: AbortSignal;
    resumeThreadId?: string;
    onStarted?: (threadId: string, turnId: string) => void;
}
export interface CodexTurnHandle {
    threadId: string;
    turnId: string;
    completion: Promise<SubagentResult>;
}
export interface CodexMessageReceipt {
    mode: "steered" | "new_turn";
    threadId: string;
    turnId: string;
    completion?: Promise<SubagentResult>;
    interrupt?: () => Promise<void>;
}
export interface CodexAppServerDependencies {
    createTransport?: (options: {
        cwd: string;
        env: NodeJS.ProcessEnv;
    }) => CodexAppServerTransport;
    env?: NodeJS.ProcessEnv;
    idleTimeoutMs?: number;
}
export declare function startCodexTurn(options: CodexTurnOptions, deps?: CodexAppServerDependencies): Promise<CodexTurnHandle>;
export declare function sendCodexMessage(options: Omit<CodexTurnOptions, "resumeThreadId"> & {
    threadId: string;
}, deps?: CodexAppServerDependencies): Promise<CodexMessageReceipt>;
export declare function runCodexTurn(options: CodexTurnOptions, deps?: CodexAppServerDependencies): Promise<SubagentResult>;
export declare function hasActiveCodexTurn(threadId: string): boolean;
export declare function __resetCodexSessionsForTests(): void;
//# sourceMappingURL=codex-app-server.d.ts.map