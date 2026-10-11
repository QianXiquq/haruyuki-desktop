export declare function shouldIncludeWorktreeTool(): boolean;
/**
 * `topic_marking_enabled`, default on.
 *
 * A global setting, like `includeWorktreeTool`: the declaration and the compiled
 * prompt are both built without a project scope in their call paths, so a
 * per-project override would be read inconsistently between them.
 */
export declare function shouldIncludeTopicMarking(): boolean;
/**
 * Whether the topic channel may be *advertised* to the model — the prompt chapter
 * and the one-shot nudge that name `TopicMark`.
 *
 * The switch alone is not enough: the tool has to be in the payload as well, or
 * the model is told to call a tool it cannot see. Every preset except `none`
 * declares it, and `auto` resolves to one of those, so the toolset preference is
 * the only extra fact needed here.
 */
export declare function shouldAdvertiseTopicMarking(agentId: string, conversationId: string): boolean;
//# sourceMappingURL=settings-tool-gates.d.ts.map