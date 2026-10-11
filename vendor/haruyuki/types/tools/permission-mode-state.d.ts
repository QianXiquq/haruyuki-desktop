import { type PermissionMode } from "../permissions/mode";
/** Mutable, shared-by-reference permission mode state. */
export type PermissionModeState = {
    mode: PermissionMode;
};
export declare function getEffectivePermissionModeState(permissionModeState?: PermissionModeState): PermissionModeState;
//# sourceMappingURL=permission-mode-state.d.ts.map