interface ApplyPatchArgs {
    input: string;
}
interface ApplyPatchResult {
    message: string;
}
/**
 * ApplyPatch implementation compatible with Codex apply_patch semantics.
 */
export declare function apply_patch(args: ApplyPatchArgs): Promise<ApplyPatchResult>;
export {};
//# sourceMappingURL=apply-patch.d.ts.map