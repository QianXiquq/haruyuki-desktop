import type { Stream } from "@letta-ai/letta-client/core/streaming";
import type { LettaStreamingResponse } from "@letta-ai/letta-client/resources/agents/messages";
export declare function summarizeStreamForDebug(stream: unknown): string;
export declare function summarizeChunkForDebug(chunk: LettaStreamingResponse | null): string;
export declare function abortStreamController(stream: Stream<LettaStreamingResponse>, reason: string): void;
//# sourceMappingURL=stream-debug.d.ts.map