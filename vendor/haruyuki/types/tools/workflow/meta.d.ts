/**
 * Extraction and validation of the `export const meta = {...}` literal that
 * must open every workflow script.
 *
 * The literal is evaluated in an empty vm context, so any identifier
 * reference, function call, or interpolation inside it throws — this is what
 * enforces the "pure literal" rule.
 */
import type { WorkflowMeta } from "./types.ts";
/** Parse and validate the meta block. Throws with a precise message. */
export declare function parseWorkflowMeta(script: string): WorkflowMeta;
/** Rewrite `export const meta` so the body can run inside a vm script. */
export declare function stripMetaExport(script: string): string;
//# sourceMappingURL=meta.d.ts.map