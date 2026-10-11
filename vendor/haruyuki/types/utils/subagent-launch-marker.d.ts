/** Consumed by the child entrypoint; shell commands from that child must not inherit it. */
export declare const SUBAGENT_LAUNCH_ENV = "HARUYUKI_SUBAGENT_LAUNCH";
export declare const SUBAGENT_LAUNCH_PROFILE_ENV = "HARUYUKI_SUBAGENT_LAUNCH_PROFILE";
export declare const SUBAGENT_NAME_ENV = "HARUYUKI_SUBAGENT_NAME";
export declare function consumeSubagentLaunch(env: NodeJS.ProcessEnv): boolean;
//# sourceMappingURL=subagent-launch-marker.d.ts.map