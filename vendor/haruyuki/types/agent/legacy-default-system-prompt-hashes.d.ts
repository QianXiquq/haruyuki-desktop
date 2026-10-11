/**
 * Exact historical Haruyuki default prompts that Cloud agents may still have
 * stored explicitly. These are SHA-256 hashes of the trimmed files at the
 * indicated letta-code commits. Never match a prefix or edited prompt here:
 * an SDK caller's custom system prompt must remain theirs.
 *
 * Hash entries are grouped by the prompt variant they came from. The variant
 * files are named `src/agent/prompts/haruyuki*.md` today; they were
 * `letta*.md` at the commits the digests were taken from.
 *
 * Cloud-capable variants: haruyuki.md, haruyuki_root_memfs.md,
 * haruyuki_no_memfs.md.
 * Before March 2026, the default used system_prompt.txt alone or composed
 * it with system_prompt_memfs.txt / system_prompt_memory.txt. Those digests
 * hash `${base.trimEnd()}\n\n${addon.trimStart()}`.trim().
 * The local-only variant is deliberately excluded.
 */
export declare const LEGACY_CLOUD_DEFAULT_PROMPT_HASHES: ReadonlySet<string>;
//# sourceMappingURL=legacy-default-system-prompt-hashes.d.ts.map