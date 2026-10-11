import { type ModPermissionDefinition } from "../mods/permission-registry";
import { type ModToolDefinition } from "../mods/tool-registry";
import type { ModContext } from "../mods/types";
import type { PermissionModeState } from "../tools/permission-mode-state";
import type { PermissionCheckResult, PermissionRules } from "./types";
type ToolArgs = Record<string, unknown>;
interface ModPermissionCheckOptions {
    conversationId?: string | null;
    modContext?: ModContext | null;
    phase?: "approval" | "execution";
    toolCallId?: string | null;
}
/**
 * Check permission for a tool execution.
 *
 * Decision logic:
 * 0. Cross-agent guard (enabled by default and unbypassable when enabled) →
 *    DENY any in-process file-tool call targeting another agent's memory dir
 *    unless it targets the current agent, targets an explicit parent agent for
 *    a subagent process, or the parent process passed --disable-memory-guard.
 * 1. Check deny rules from settings (first match wins) → DENY
 * 2. Check CLI disallowedTools (--disallowedTools flag) → DENY
 * 3. Check alwaysAsk rules and mod tool alwaysAsk policy → ALWAYS_ASK
 * 4. Check permission mode (--permission-mode flag) → ALLOW or DENY
 * 5. Check CLI allowedTools (--allowedTools flag) → ALLOW
 * 6. For Read/Glob/Grep within working directory → ALLOW
 * 7. Check session allow rules (first match wins) → ALLOW
 * 8. Check allow rules from settings (first match wins) → ALLOW
 * 9. Check ask rules from settings (first match wins) → ASK
 * 10. Fall back to default behavior for tool → ASK or ALLOW
 *
 * @param toolName - Name of the tool (e.g., "Read", "Bash", "Write")
 * @param toolArgs - Tool arguments (contains file paths, commands, etc.)
 * @param permissions - Loaded permission rules
 * @param workingDirectory - Current working directory
 */
export declare function checkPermission(toolName: string, toolArgs: ToolArgs, permissions: PermissionRules, workingDirectory?: string, modeState?: PermissionModeState, agentId?: string, modTools?: Map<string, ModToolDefinition>): PermissionCheckResult;
/**
 * Check permission for a tool execution with hook support.
 * When the decision would be "ask" (show permission dialog), runs PermissionRequest hooks
 * which can auto-allow (exit 0) or auto-deny (exit 2) without showing UI.
 *
 * @param toolName - Name of the tool
 * @param toolArgs - Tool arguments
 * @param permissions - Loaded permission rules
 * @param workingDirectory - Current working directory
 */
export declare function checkPermissionWithHooks(toolName: string, toolArgs: ToolArgs, permissions: PermissionRules, workingDirectory?: string, modeState?: PermissionModeState, agentId?: string, modPermissions?: Map<string, ModPermissionDefinition>, modTools?: Map<string, ModToolDefinition>, modPermissionOptions?: ModPermissionCheckOptions): Promise<PermissionCheckResult>;
export {};
//# sourceMappingURL=checker.d.ts.map