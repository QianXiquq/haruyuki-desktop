/** CLI execution options owned by one listener conversation, never process.env. */
export interface RuntimeExecutionSettings {
    tools?: string[];
    preload_skills?: string[];
    allowed_tools: string[];
    disallowed_tools: string[];
    max_turns?: number;
    parent_agent_id?: string;
    agent_role?: "subagent";
    transcript_path?: string;
    memory_directory?: string;
    disable_memory_guard: boolean;
}
export declare function isRuntimeExecutionSettings(value: unknown): value is RuntimeExecutionSettings;
export declare function getRuntimeExecutionEnv(env: NodeJS.ProcessEnv, settings?: RuntimeExecutionSettings): NodeJS.ProcessEnv;
//# sourceMappingURL=runtime-execution-settings.d.ts.map