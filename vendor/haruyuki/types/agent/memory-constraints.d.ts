/**
 * Self-contained validator installed beside the MemFS pre-commit hook.
 *
 * It runs under Node because Haruyuki requires Node 22.19 or newer. Keeping
 * the validator dependency-free lets Git execute it from agent and shared
 * memory repositories without resolving the Haruyuki package at commit time.
 *
 * The optional tracked `.memfs.config.json` file accepts:
 * - `version`: the required config format version (currently 1)
 * - `maxFileCharacters`: a default cap for each projected memory Markdown file
 * - `maxCoreMemoryCharacters`: a cap for all root Markdown loaded into a v2
 *   agent's system prompt
 * - `fileCharacterLimits`: ordered glob overrides; the first match wins, and a
 *   null limit leaves matching files uncapped
 * - `maxDepth`: the number of directories allowed between the repo root and a
 *   projected memory file
 *
 * File limits count the complete staged file, including frontmatter.
 */
export { MEMORY_CONSTRAINTS_CONFIG_PATH } from "../memory-constraints";
export declare const MEMORY_CONSTRAINTS_VALIDATOR_NAME = "letta-memory-constraints.cjs";
export declare const MEMORY_CONSTRAINTS_UPDATE_ENV = "HARUYUKI_MEMORY_CONSTRAINTS_UPDATE";
export declare const MEMORY_CONSTRAINTS_VALIDATOR_SCRIPT: string;
//# sourceMappingURL=memory-constraints.d.ts.map