/**
 * 流式负载自测。
 *
 * ## 为什么需要这条 check
 *
 * 曾经的真实 bug：服务端**逐 token** 推 delta，主进程**逐 token** 转成 IPC，
 * 渲染进程每收一次就**复制整个 items 数组**并**全量重渲染**。实测一轮短回复
 * **231 次增量事件**（推理 225 + 正文 6），合起来 O(n²) —— 发一句"你好"
 * 就能把 CPU 打满、界面卡死。
 *
 * 而当时**所有 check 都是"发一句、断言正文非空"**，完全测不出负载问题。
 * 所以这条 check 断言的是**事件数量与响应长度脱钩**：
 *
 *   ① 增量事件数**远小于**文本长度（逐 token 时二者同阶）
 *   ② 有**绝对上界**（长回复也一样），这才能证明是"按时间批处理"而不是"按量"
 *   ③ 批处理**不丢字、不乱序**（拼接结果必须完整）
 *
 * 注意：会真实调用模型，且为了拉长流式故意要求它输出较长内容。
 */
import WebSocket from "ws";
import { AppServerBridge } from "@/main/app-server";
import { startServer } from "@/main/server-process";
import { describeCheckServer, resolveCheckServerCommand } from "./server-command";
import type { HaruyukiEvent } from "@/shared/ipc-contract";

const checks: { label: string; ok: boolean; detail?: string }[] = [];
function check(label: string, ok: boolean, detail?: string): void {
  checks.push({ label, ok, ...(detail ? { detail } : {}) });
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` —— ${detail}` : ""}`);
}

const SERVER_CMD = resolveCheckServerCommand();
console.log("服务端产物:", describeCheckServer(SERVER_CMD));

const server = await startServer({ command: SERVER_CMD });

// ---------- ① 事件量测（不经过渲染进程，直接数主进程发出的事件）----------
let totalEmits = 0;
let batchEvents = 0;
let legacyDeltaEvents = 0;
let assistantText = "";
let reasoningText = "";
const kinds = new Map<string, number>();

const bridge = new AppServerBridge((e: HaruyukiEvent) => {
  totalEmits++;
  kinds.set(e.kind, (kinds.get(e.kind) ?? 0) + 1);
  if (e.kind === "stream_batch") {
    batchEvents++;
    assistantText += e.assistant ?? "";
    reasoningText += e.reasoning ?? "";
  } else if (e.kind === "assistant_delta" || e.kind === "reasoning_delta") {
    legacyDeltaEvents++;
  }
});
await bridge.connect(server.wsUrl, WebSocket);
const agents = await bridge.listAgents();
const agent = agents.find((a) => a.name === "Tutor") ?? agents[0]!;
await bridge.startRuntime(agent.id, "standard");

// ---------- ② 拉长流式：要求较长的输出 ----------
console.log("\n=== 发一轮较长回复，量事件数 ===");
bridge.sendMessage("Count from 1 to 60, one number per line, then stop. Numbers only.");
await new Promise((r) => setTimeout(r, 60_000));

const streamedChars = assistantText.length + reasoningText.length;
console.log(`   正文 ${assistantText.length} 字符 / 推理 ${reasoningText.length} 字符（合计 ${streamedChars}）`);
console.log(`   增量事件: stream_batch ${batchEvents} / 旧的逐 token ${legacyDeltaEvents}`);
console.log(`   总 emit: ${totalEmits}`);
console.log("   事件类型分布:", [...kinds.entries()].map(([k, v]) => `${k}×${v}`).join(", "));

check("有流式内容产生", streamedChars > 0, `${streamedChars} 字符`);
check(
  "没有未批处理的逐 token 事件",
  legacyDeltaEvents === 0,
  `旧的 assistant_delta/reasoning_delta 事件数 = ${legacyDeltaEvents}`,
);
check(
  "增量事件数远小于文本长度（逐 token 时二者同阶）",
  batchEvents > 0 && batchEvents * 10 < streamedChars,
  `${batchEvents} 次事件 / ${streamedChars} 字符（比值 ${(streamedChars / Math.max(batchEvents, 1)).toFixed(1)} 字符每事件）`,
);
// 绝对上界：这是"按时间批处理"的证据。60 秒窗口 / 50ms ≈ 1200 次理论上限，
// 但真实流式远低于此；给一个宽松但能抓住"逐 token 回归"的上界。
check(
  "增量事件数有绝对上界（< 200）",
  batchEvents < 200,
  `${batchEvents} 次（逐 token 时一条长回复轻易超过 500）`,
);
check(
  "总 emit 次数有上界（< 300）",
  totalEmits < 300,
  `${totalEmits} 次`,
);

// ---------- ③ 批处理不能丢字 ----------
console.log("\n=== 批处理完整性 ===");
// 要求它输出 1..60，检查关键数字都在（不要求格式完全一致）
const hasNumbers = ["1", "30", "60"].every((n) => assistantText.includes(n) || reasoningText.includes(n));
check("正文里能找到关键数字（1 / 30 / 60）", hasNumbers, JSON.stringify(assistantText.slice(0, 60)));
check(
  "正文没有明显重复拼接（批处理不该重复发送同一段）",
  assistantText.length < 5000,
  `${assistantText.length} 字符`,
);

// ---------- ④ 确定性验证批处理：直接喂逐 token 帧 ----------
//
// ⚠️ 上面那一段依赖模型行为（它可能一口气推完、不走推理），**不稳定**。
// 所以这里用合成帧按真实节奏驱动同一个批处理逻辑：
// 200 个 token、每 5ms 一个（≈1 秒的持续流式），断言事件数被压到时间窗口的量级，
// 而不是 token 的量级。
console.log("\n=== 确定性验证：200 个 token 按 5ms 间隔喂进去 ===");
{
  const events: HaruyukiEvent[] = [];
  const probeBridge = new AppServerBridge((e) => events.push(e));
  // 只驱动内部处理函数，不建真连接 —— 这样时序完全可控。
  const internal = probeBridge as unknown as {
    handleMessage(message: unknown): void;
  };

  const TOKENS = 200;
  for (let i = 0; i < TOKENS; i++) {
    internal.handleMessage({
      type: "stream_delta",
      delta: { type: "message", message_type: "assistant_message", content: [{ type: "text", text: `t${i} ` }] },
    });
    await new Promise((r) => setTimeout(r, 5));
  }
  // 等最后一个窗口冲刷完
  await new Promise((r) => setTimeout(r, 200));

  const batches = events.filter((e) => e.kind === "stream_batch");
  const chars = batches.map((e) => (e.kind === "stream_batch" ? (e.assistant ?? "") : "")).join("");
  const legacy = events.filter((e) => e.kind === "assistant_delta").length;

  // ⚠️ 这个 bridge 的 emit 里**只有合成帧**？不是 —— 它也可能收到别的东西。
  // 更稳的判据：把每个 token 的唯一标记数一遍，每个必须**恰好出现一次**。
  // （早先我断言"总长度 == TOKENS*3"，既被别的文本污染、也依赖于 token 长度恒定，
  //  两次运行都因此误报。）
  const counts = Array.from({ length: TOKENS }, (_, i) => {
    const needle = `t${i} `;
    return chars.split(needle).length - 1;
  });
  const missing = counts.filter((c) => c === 0).length;
  const duplicated = counts.filter((c) => c > 1).length;

  console.log(`   ${TOKENS} 个 token → stream_batch ${batches.length} 次 / 旧事件 ${legacy} 次`);
  console.log(`   拼接后总长 ${chars.length} 字符（含同 bridge 收到的其它文本）`);

  check(
    "批处理把事件数从 token 量级压到时间窗口量级",
    batches.length > 0 && batches.length < TOKENS / 4,
    `${TOKENS} token → ${batches.length} 次事件（逐 token 时会是 ${TOKENS} 次）`,
  );
  check(
    "事件数与 50ms 窗口相符（1 秒流式 → 约 20 次）",
    batches.length >= 5 && batches.length <= 40,
    `${batches.length} 次`,
  );
  check("没有遗留未批处理的逐 token 事件", legacy === 0, `${legacy} 次`);
  check(
    "每个 token 都恰好出现一次（不丢字、不重复）",
    missing === 0 && duplicated === 0,
    `缺失 ${missing} 个、重复 ${duplicated} 个`,
  );
  check(
    "顺序没有被批处理打乱",
    chars.startsWith("t0 ") && chars.trimEnd().endsWith(`t${TOKENS - 1}`),
    `开头 ${JSON.stringify(chars.slice(0, 6))} / 结尾 ${JSON.stringify(chars.trimEnd().slice(-6))}`,
  );
}

const failed = checks.filter((c) => !c.ok);
console.log(`\n=== 结果：${checks.length - failed.length}/${checks.length} 通过 ===`);
if (failed.length > 0) {
  for (const item of failed) console.log(`  ❌ ${item.label}${item.detail ? ` —— ${item.detail}` : ""}`);
  process.exitCode = 1;
}
bridge.close();
server.stop();
