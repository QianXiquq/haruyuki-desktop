/**
 * 会话删除自测。
 *
 * ⚠️ 会**真实创建并删除**一个临时会话，全程不碰其他会话。
 *
 * 这里守的是"不可逆操作"的安全边界：
 *   ① 目录名编码是 **base64url（无填充）** —— 用带填充的 `base64` 会指向不存在的路径，
 *      于是删除静默无效（我第一版就栽在这上面，测试还"看起来没问题"）
 *   ② 编码必须可逆（防编码歧义导致删错）
 *   ③ 路径逃逸（`../`、含 `/`）必须被拒
 *   ④ 删除后**目录真的没了**、且不会被重建
 *   ⑤ **记忆不受影响** —— MemFS 按 agent 存，删会话不该动它
 */
import WebSocket from "ws";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { AppServerBridge } from "@/main/app-server";
import { startServer } from "@/main/server-process";
import { resolveCheckServerCommand, describeCheckServer } from "./server-command";
import {
  conversationDirName,
  conversationIdFromDirName,
  conversationStoreRoot,
  deleteConversation,
  listStoredConversationIds,
} from "@/main/conversation-store";

const checks: { label: string; ok: boolean; detail?: string }[] = [];
function check(label: string, ok: boolean, detail?: string): void {
  checks.push({ label, ok, ...(detail ? { detail } : {}) });
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` —— ${detail}` : ""}`);
}

console.log("服务端产物:", describeCheckServer(resolveCheckServerCommand()));
console.log("会话存储根:", conversationStoreRoot());

// ---------- ① 编码规则 ----------
console.log("\n=== ① 目录名编码 ===");
const sample = conversationDirName("local-conv-1");
check(
  "用 base64url（无 `=` 填充）",
  !sample.includes("="),
  `local-conv-1 → ${sample}`,
);
check(
  "与磁盘上的实际目录名一致",
  existsSync(join(conversationStoreRoot(), sample)),
  join(conversationStoreRoot(), sample),
);
check(
  "编码可逆",
  conversationIdFromDirName(sample) === "local-conv-1",
  `反解 → ${conversationIdFromDirName(sample)}`,
);
check(
  "带填充的 base64 **不**匹配任何目录（说明必须用 url 变体）",
  !existsSync(join(conversationStoreRoot(), Buffer.from("conversation:local-conv-1").toString("base64"))),
  Buffer.from("conversation:local-conv-1").toString("base64"),
);

// ---------- ② 路径逃逸必须被拒 ----------
console.log("\n=== ② 路径逃逸必须被拒 ===");
for (const bad of ["../evil", "a/b", "..", "", "x\\y"]) {
  let rejected = false;
  let msg = "";
  try {
    deleteConversation(bad);
  } catch (e) {
    rejected = true;
    msg = e instanceof Error ? e.message : String(e);
  }
  check(`拒绝非法 id ${JSON.stringify(bad)}`, rejected, msg.slice(0, 70));
}

// ---------- ③ 真实删除一个临时会话 ----------
console.log("\n=== ③ 真实删除（临时会话）===");
const before = listStoredConversationIds();
const server = await startServer({ command: resolveCheckServerCommand() });
const bridge = new AppServerBridge(() => {});
await bridge.connect(server.wsUrl, WebSocket);
const agents = await bridge.listAgents();
const agent = agents.find((a) => a.name === "Tutor") ?? agents[0]!;
const scope = await bridge.startRuntime(agent.id, "standard");
const target = scope.conversation_id;
const dir = join(conversationStoreRoot(), conversationDirName(target));

check("临时会话目录已创建", existsSync(dir), target);
check("它在列表里", (await bridge.listConversations(agent.id)).some((c) => c.id === target));

const result = deleteConversation(target);
check("删除返回 removed=true", result.removed === true, JSON.stringify(result));
check("目录已消失", !existsSync(dir));
check("不在磁盘清单里了", !listStoredConversationIds().includes(target));
check("没有其他会话被误删", listStoredConversationIds().length === before.length, `${before.length} → ${listStoredConversationIds().length}`);

await new Promise((r) => setTimeout(r, 2000));
check("不会被重建", !existsSync(dir));

const again = deleteConversation(target);
check("重复删除是幂等的（alreadyGone）", again.alreadyGone === true && again.removed === false, JSON.stringify(again));

// ---------- ④ 记忆不受影响 ----------
console.log("\n=== ④ 记忆不受影响（删会话不该动记忆）===");
const snapshot = await bridge.listMemory(agent.id);
check("记忆仍可读", snapshot.files.length > 0, `${snapshot.files.length} 个文件`);
check(
  "persona.md 还在",
  snapshot.files.some((f) => f.path === "persona.md"),
);

bridge.close();
server.stop();

const failed = checks.filter((c) => !c.ok);
console.log(`\n=== 结果：${checks.length - failed.length}/${checks.length} 通过 ===`);
if (failed.length > 0) {
  for (const item of failed) console.log(`  ❌ ${item.label}${item.detail ? ` —— ${item.detail}` : ""}`);
  process.exitCode = 1;
}
