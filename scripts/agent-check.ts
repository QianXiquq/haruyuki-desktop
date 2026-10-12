/**
 * agent 列表 + 新建自测（P1 第 4 项）。
 *
 * ⚠️ **本 check 会真实创建一个 agent，并在结束时删掉它**。清理必须成功 ——
 * 否则每跑一次你的 agent 列表就多一个垃圾项（我之前给 B1 留过这种债，这次补上）。
 *
 * 断言：
 *   ① 列表能读到，且每条都有 id
 *   ② **只给 name 就能建**（body 其余字段全可选）—— 这是 GUI 只收名称的依据
 *   ③ 新建的 agent **真的出现在列表里**
 *   ④ 服务端会补上默认模型，不会留空
 *   ⑤ 空名称在**我们这层**就被拒（不 spawn 请求）
 *   ⑥ 清理：删掉后列表长度回到创建前
 */
import WebSocket from "ws";
import { AppServerBridge } from "@/main/app-server";
import { startServer } from "@/main/server-process";
import { describeCheckServer, resolveCheckServerCommand } from "./server-command";

const checks: { label: string; ok: boolean; detail?: string }[] = [];
function check(label: string, ok: boolean, detail?: string): void {
  checks.push({ label, ok, ...(detail ? { detail } : {}) });
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` —— ${detail}` : ""}`);
}

const SERVER_CMD = resolveCheckServerCommand();
console.log("服务端产物:", describeCheckServer(SERVER_CMD));

const server = await startServer({ command: SERVER_CMD });
const bridge = new AppServerBridge(() => {});
await bridge.connect(server.wsUrl, WebSocket);

// ---------- ① 列表 ----------
console.log("\n=== ① agent 列表 ===");
const before = await bridge.listAgents();
check("能读到 agent 列表", before.length > 0, `${before.length} 个`);
check("每条都有 id", before.every((a) => a.id.length > 0));
console.log("   " + before.map((a) => `${a.name ?? "(无名)"} <${a.id.slice(0, 20)}…>`).join("\n   "));

// ---------- ② 只给 name 建 ----------
console.log("\n=== ② 只给 name 新建 ===");
const name = `check-agent-${Date.now().toString(36)}`;
let createdId: string | null = null;
try {
  const created = await bridge.createAgent(name);
  createdId = created.id;
  check("返回了 id", created.id.length > 0, created.id);
  check("返回的名称就是请求的名称", created.name === name, `请求 ${name} → 回执 ${created.name}`);
} catch (e) {
  check("只给 name 就能创建", false, e instanceof Error ? e.message : String(e));
}

// ---------- ③ 出现在列表里 ----------
console.log("\n=== ③ 新 agent 出现在列表里 ===");
const after = await bridge.listAgents();
check("列表长度 +1", after.length === before.length + 1, `${before.length} → ${after.length}`);
check("能在列表里按 id 找到它", after.some((a) => a.id === createdId), createdId ?? "");

// ---------- ④ 服务端补了默认模型 ----------
console.log("\n=== ④ 服务端补默认模型（只传 name，模型不能为空）===");
const raw = (await bridge.current.request("agent_list", {})) as unknown as { agents?: Record<string, unknown>[] };
const rawNew = (raw.agents ?? []).find((a) => a.id === createdId);
const model = rawNew?.model;
check(
  "新 agent 有非空 model（服务端补的默认，不是我们传的）",
  typeof model === "string" && model.length > 0,
  `model=${JSON.stringify(model)}`,
);

// ---------- ⑤ 空名称在我们这层被拒 ----------
console.log("\n=== ⑤ 空名称必须被拒 ===");
let rejected = false;
let message = "";
try {
  await bridge.createAgent("   ");
} catch (e) {
  rejected = true;
  message = e instanceof Error ? e.message : String(e);
}
check("空名称抛错（不会真的建出一个无名 agent）", rejected, message.slice(0, 80));
const afterBlank = await bridge.listAgents();
check("被拒后列表长度没变（没有偷偷建出来）", afterBlank.length === after.length, `${after.length} → ${afterBlank.length}`);

// ---------- ⑥ 清理 ----------
console.log("\n=== ⑥ 清理（本 check 的副作用必须自己收拾）===");
if (createdId) {
  const del = (await bridge.current.request("agent_delete", { agent_id: createdId })) as unknown as {
    success?: boolean;
    error?: string;
  };
  check("删除请求成功", del.success !== false, del.error ?? "");
  const cleaned = await bridge.listAgents();
  check(
    "清理后列表长度回到创建前",
    cleaned.length === before.length,
    `${before.length} → 创建后 ${after.length} → 清理后 ${cleaned.length}`,
  );
  if (cleaned.length !== before.length) {
    console.log(`   ⚠️ 残留：${createdId}（请手动删除）`);
  }
}

const failed = checks.filter((c) => !c.ok);
console.log(`\n=== 结果：${checks.length - failed.length}/${checks.length} 通过 ===`);
if (failed.length > 0) {
  for (const item of failed) console.log(`  ❌ ${item.label}${item.detail ? ` —— ${item.detail}` : ""}`);
  process.exitCode = 1;
}
bridge.close();
server.stop();
