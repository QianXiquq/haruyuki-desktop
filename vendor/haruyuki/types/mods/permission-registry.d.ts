import type { ModContext, ModDiagnostic, ModOwner, ModPermission, ModPermissionCheckEvent } from "./types";
export interface ModPermissionDefinition extends ModPermission {
    activationSignal: AbortSignal;
    recordDiagnostic?: (diagnostic: Pick<ModDiagnostic, "capability" | "error" | "phase" | "severity">) => void;
}
export interface ModPermissionDecisionResult {
    decision: "allow" | "ask" | "alwaysAsk" | "deny";
    matchedRule: string;
    reason?: string;
}
export declare function filterAvailableModPermissionsRegistry(registry: Map<string, ModPermissionDefinition>, context?: ModContext | null): Map<string, ModPermissionDefinition>;
export declare function getAvailableModPermissionsRegistry(context?: ModContext | null): Map<string, ModPermissionDefinition>;
export declare function registerModPermission(permission: ModPermissionDefinition): void;
export declare function unregisterModPermission(id: string, owner: ModOwner): void;
export declare function unregisterModPermissionsForOwner(owner: ModOwner): void;
export declare function clearModPermissions(): void;
export declare function getModPermissionDefinition(id: string, registry?: Map<string, ModPermissionDefinition>): ModPermissionDefinition | undefined;
export declare function checkModPermissions(event: ModPermissionCheckEvent, registry?: Map<string, ModPermissionDefinition>, context?: ModContext | null): Promise<ModPermissionDecisionResult | undefined>;
//# sourceMappingURL=permission-registry.d.ts.map