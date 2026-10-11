import type { ModCommand } from "../../mods/types";
import type { ModCommandInfo } from "../../types/protocol_v2";
import type { ListenerRuntime } from "./types";
export declare function listListenerModCommands(runtime: ListenerRuntime, agentId?: string | null): ModCommandInfo[];
export declare function getListenerModCommand(runtime: ListenerRuntime, commandId: string, agentId?: string | null): ModCommand | undefined;
//# sourceMappingURL=mod-command-registry.d.ts.map