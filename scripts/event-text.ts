/**
 * 从事件流里收集**正文**与**推理**文本的共享助手。
 *
 * ## 为什么需要它（以及为什么不能只认一种事件）
 *
 * 主进程把流式增量做了**批处理**：逐 token 的 `assistant_delta` / `reasoning_delta`
 * 被合并成 `stream_batch`（正文与推理在同一个事件里），以把"每个 token 一次
 * `setItems` + 全量重渲染"压成"每 ~50ms 一次"。
 *
 * 这件事**打破了所有 check 里 `filter(e => e.kind === "assistant_delta")` 的写法** ——
 * 它们会静默收集到空字符串，然后断言"正文非空"失败。这个助手的职责就是让这件事
 * 只在一个地方处理：**同时认两种事件**，于是无论批处理开还是关都收集得到。
 *
 * 这也是为什么 `check:perf` 要显式断言"没有遗留的逐 token 事件"—— 那是**故意不要**的。
 */
import type { HaruyukiEvent } from "@/shared/ipc-contract";

/** 该事件里的正文增量（批处理与逐 token 两种形态都认）。 */
export function assistantTextOf(event: HaruyukiEvent): string {
  if (event.kind === "stream_batch") return event.assistant ?? "";
  if (event.kind === "assistant_delta") return event.text;
  return "";
}

/** 该事件里的推理增量。 */
export function reasoningTextOf(event: HaruyukiEvent): string {
  if (event.kind === "stream_batch") return event.reasoning ?? "";
  if (event.kind === "reasoning_delta") return event.text;
  return "";
}

/** 把一段事件流拼成完整正文。 */
export function collectAssistantText(events: HaruyukiEvent[]): string {
  return events.map(assistantTextOf).join("");
}

/** 把一段事件流拼成完整推理。 */
export function collectReasoningText(events: HaruyukiEvent[]): string {
  return events.map(reasoningTextOf).join("");
}
