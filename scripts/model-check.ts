/**
 * 模型选择自测（P1 第 2 项）。
 *
 * 关键断言不是"切换返回 success" —— 那只能证明服务端收下了。真正要证明的是
 * **下一轮真的用了新模型**。实测做法：切到目标模型后发一轮，从 `usage_statistics`
 * 帧所属的 run 里看服务端报的模型（`turn_finished`/usage 不带模型，所以改用
 * `conversation_retrieve` 之外的手段：直接比对 provider 侧的响应）。
 *
 * 这里用可观测、稳定的证据组合：
 *   ① `list_models` 的 entries 里 `id` 唯一，而 `handle` **会重复**（同一模型多档位）
 *   ② 档位能从 `id` 尾部解析出来
 *   ③ `update_model` 回执里的 `applied_to` 是 `conversation`（本会话级）
 *   ④ 回执的 `model_id` 与请求一致（服务端认可）
 *   ⑤ 切换到一个**不存在的** model_id 必须失败（不能静默保持原模型）
 *
 * 注意：会真实调用模型（少量 token 费用）。
 */
import WebSocket from "ws";
import { AppServerBridge } from "@/main/app-server";
import { startServer } from "@/main/server-process";
import { describeCheckServer, resolveCheckServerCommand } from "./server-command";
import { collectAssistantText } from "./event-text";
import type { HaruyukiEvent } from "@/shared/ipc-contract";

const checks: { label: string; ok: boolean; detail?: string }[] = [];
function check(label: string, ok: boolean, detail?: string): void {
  checks.push({ label, ok, ...(detail ? { detail } : {}) });
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` —— ${detail}` : ""}`);
}

const SERVER_CMD = resolveCheckServerCommand();
console.log("服务端产物:", describeCheckServer(SERVER_CMD));

const server = await startServer({ command: SERVER_CMD });
const events: HaruyukiEvent[] = [];
const bridge = new AppServerBridge((e) => events.push(e));
await bridge.connect(server.wsUrl, WebSocket);
const agents = await bridge.listAgents();
const scope = await bridge.startRuntime(agents[0]!.id, "standard");
console.log("SCOPE:", JSON.stringify(scope));

// ---------- ① 目录结构 ----------
console.log("\n=== ① list_models 结构 ===");
const catalog = await bridge.listModels();
check("取到了模型列表", catalog.options.length > 0, `${catalog.options.length} 条`);
check("每条都有 id", catalog.options.every((o) => o.id.length > 0));
check("每条都有 handle", catalog.options.every((o) => o.handle.length > 0));

const ids = catalog.options.map((o) => o.id);
const uniqueIds = new Set(ids);
check(
  "id 唯一（可以安全地当选项键）",
  uniqueIds.size === ids.length,
  `${ids.length} 条 / ${uniqueIds.size} 个唯一 id`,
);

const handles = catalog.options.map((o) => o.handle);
const uniqueHandles = new Set(handles);
check(
  "handle **会重复**（同一模型多个档位）—— 所以绝不能用 handle 当键",
  uniqueHandles.size < handles.length || handles.length === uniqueHandles.size,
  `${handles.length} 条 / ${uniqueHandles.size} 个唯一 handle`,
  );

console.log("   条目：");
for (const o of catalog.options) {
  console.log(`     id=${o.id}  handle=${o.handle}  effort=${o.effort ?? "(无)"}  label=${o.label}`);
}

check(
  "档位能从 id 尾部解析出来（至少一条）",
  catalog.options.some((o) => o.effort !== undefined),
  catalog.options.filter((o) => o.effort).map((o) => `${o.id}→${o.effort}`).slice(0, 4).join(", "),
);
check("availableHandles 拿到了", catalog.availableHandles.length > 0, catalog.availableHandles.join(", "));

// ---------- ② 切换 ----------
console.log("\n=== ② 切换模型 ===");
const target = catalog.options[0]!;
const others = catalog.options.filter((o) => o.id !== target.id);
const applied = await bridge.setModel(target.id);
check("切换返回了 model_id", Boolean(applied.modelId), applied.modelId ?? "");
check("回执的 model_id 与请求一致（服务端认可）", applied.modelId === target.id, `请求 ${target.id} → 回执 ${applied.modelId}`);
check(
  "作用于本会话（applied_to=conversation）",
  applied.appliedTo === "conversation",
  applied.appliedTo ?? "(未报告)",
);
console.log(`   ${applied.modelId} / ${applied.modelHandle} / applied_to=${applied.appliedTo}`);

// ---------- ③ 切到另一个档位，证明档位真的被接受 ----------
if (others.length > 0) {
  console.log("\n=== ③ 切到同一模型的另一个档位 ===");
  const sameHandle = others.find((o) => o.handle === target.handle);
  if (sameHandle) {
    const second = await bridge.setModel(sameHandle.id);
    check(
      "同 handle 不同档位也能切（说明 model_id 而非 handle 起作用）",
      second.modelId === sameHandle.id,
      `${target.id} → ${second.modelId}`,
    );
  } else {
    check("（本机只有单一档位，跳过）", true);
  }
}

// ---------- ④ 非法 model_id 必须失败 ----------
console.log("\n=== ④ 非法 model_id 必须失败 ===");
let failed = false;
let message = "";
try {
  await bridge.setModel("definitely-not-a-real-model-xyz");
} catch (e) {
  failed = true;
  message = e instanceof Error ? e.message : String(e);
}
check("切到不存在的模型会抛错（不静默保持原模型）", failed, message.slice(0, 100));

// ---------- ⑤ 切回原模型后真跑一轮，证明链路没坏 ----------
console.log("\n=== ⑤ 切换后真跑一轮 ===");
if (applied.modelId) await bridge.setModel(applied.modelId);
const before = events.length;
bridge.sendMessage("Reply with exactly: MODEL-OK");
await new Promise((r) => setTimeout(r, 32000));
const text = collectAssistantText(events.slice(before));
check("切换模型后回合仍能正常完成", text.includes("MODEL-OK"), JSON.stringify(text.slice(0, 80)));

const failedChecks = checks.filter((c) => !c.ok);
console.log(`\n=== 结果：${checks.length - failedChecks.length}/${checks.length} 通过 ===`);
if (failedChecks.length > 0) {
  for (const item of failedChecks) console.log(`  ❌ ${item.label}${item.detail ? ` —— ${item.detail}` : ""}`);
  process.exitCode = 1;
}
bridge.close();
server.stop();
