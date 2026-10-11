/**
 * Secret handling for shell tool arguments and output.
 */
/**
 * Scan a command string or command-argument array for `$SECRET_NAME`
 * references and build an env map of matching secrets from the store.
 * The shell will expand these vars natively, so secret values never get
 * injected into the command string itself.
 */
export declare function extractSecretEnvFromCommand(command: string | readonly string[], agentId?: string): Record<string, string>;
/**
 * Capture the ambient credentials visible when a tool or child process starts.
 * Keep this map with the invocation: ambient auth may rotate before its output
 * is returned, saved to a file, or sent in a completion notification.
 */
export declare function captureSecretRedactions(secrets?: Readonly<Record<string, string>>): Record<string, string>;
/**
 * The ambient runtime auth values as a name → value record, for redaction
 * systems (e.g. mod tool output) that keep their own secret maps instead of
 * calling scrubSecretsFromString.
 */
export declare function getAmbientRedactionSecrets(): Record<string, string>;
/**
 * Scrub the supplied secret values from a string, replacing them with an
 * explicit placeholder that makes it unambiguous to the LLM that the value is
 * hidden. Ambient runtime auth values (at minimum the effective LETTA_API_KEY)
 * are always scrubbed as well, even when the caller passes no secrets.
 */
export declare function scrubSecretsFromString(input: string, secrets: Readonly<Record<string, string>>): string;
/**
 * Scrub only the ambient runtime auth values from a string. For text produced
 * by hook or mod code — user-configured commands whose children inherit the
 * runtime environment — rather than by a shell tool invocation.
 */
export declare function scrubAmbientSecrets(text: string): string;
export interface SecretStreamScrubber {
    /** Scrub one chunk; may return "" while holding back a potential partial match. */
    push(chunk: string): string;
    /** Scrub and return any held-back remainder at end of stream. */
    flush(): string;
}
/**
 * Stream-safe secret scrubber. Plain per-chunk replacement misses a credential
 * split across two stream chunks; this scrubber holds back any trailing bytes
 * that could be the beginning of a secret and emits them once later chunks
 * (or flush()) prove whether the match completes.
 */
export declare function createSecretStreamScrubber(secrets?: Readonly<Record<string, string>>): SecretStreamScrubber;
export interface ScrubbedOutputStreamer {
    onOutput: (chunk: string, stream: "stdout" | "stderr") => void;
    flush: () => void;
}
/**
 * Wrap a streaming output callback with chunk-boundary-safe secret scrubbing.
 * flush() emits any held-back tail once the producer has finished.
 */
export declare function createScrubbedOutputStreamer(secrets: Readonly<Record<string, string>>, emit: (chunk: string, stream: "stdout" | "stderr") => void, transformChunk?: (chunk: string) => string): ScrubbedOutputStreamer;
/**
 * Scrub secret values from a tool's model-facing return content. Always covers
 * the ambient runtime auth values, even when `secrets` is empty.
 */
export declare function sanitizeToolReturnContent<T extends string | Array<{
    type?: string;
    text?: unknown;
}>>(content: T, secrets: Readonly<Record<string, string>>, stripAnsiEscapes: boolean): T;
/** Scrub secret values from captured stdout/stderr lines, in place. */
export declare function sanitizeOutputLines(lines: string[], secrets: Readonly<Record<string, string>>, stripAnsiEscapes: boolean): void;
//# sourceMappingURL=secret-substitution.d.ts.map