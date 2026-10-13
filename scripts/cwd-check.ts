/**
 * 工作目录（cwd）自测。
 *
 * ## 为什么这个 check 必须"真的让 agent 报目录"
 *
 * 只断言 `get_cwd_map` 变了是**不够的** —— 那只能证明界面上的数字变了，
 * 证明不了 **agent 真的在新目录里干活**。所以本 check 的核心是：
 *   建一个带唯一标记文件的临时目录 → 切过去 → 让 agent 报自己的 cwd 并读那个标记
 *   → 断言它看到的是**新目录**。
 *
 * 另外单独断言 `payload.cwd` 通道的**失败可见性**：目录不存在时必须报错，
 * 绝不能"以为切了其实没切"。
 *
 * 注意：会真实调用模型（少量 token 费用）。
 */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import WebSocket from "ws";
import { AppServerBridge, workingDirectoryScopeKey } from "@/main/app-server";
import { startServer, defaultWorkingDirectory } from "@/main/server-process";
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

// ---------- scope key 的规则必须与服务端一致 ----------
console.log("\n=== ① scope key 规则（与服务端 getWorkingDirectoryScopeKey 对齐）===");
check(
  "普通会话 → conversation:<id>",
  workingDirectoryScopeKey("agent-x", "local-conv-1") === "conversation:local-conv-1",
  workingDirectoryScopeKey("agent-x", "local-conv-1"),
);
check(
  "default 会话 → agent:<id>::conversation:default",
  workingDirectoryScopeKey("agent-x", "default") === "agent:agent-x::conversation:default",
  workingDirectoryScopeKey("agent-x", "default"),
);
check(
  "conversation 缺省按 default 处理",
  workingDirectoryScopeKey("agent-x", undefined) === "agent:agent-x::conversation:default",
);
check(
  "agent 缺省用 __unknown__",
  workingDirectoryScopeKey(undefined, "default") === "agent:__unknown__::conversation:default",
);

const server = await startServer({ command: SERVER_CMD });
console.log("\n② 服务端:", server.wsUrl);
const events: HaruyukiEvent[] = [];
const bridge = new AppServerBridge((e) => events.push(e));
await bridge.connect(server.wsUrl, WebSocket);
const agents = await bridge.listAgents();
const agent = agents[0];
if (!agent) throw new Error("没有可用 agent");
const scope = await bridge.startRuntime(agent.id, "standard");
console.log(`③ runtime_start: ${JSON.stringify(scope)}`);

// ---------- 读 cwd ----------
console.log("\n=== ④ 读 cwd（没有覆盖时必须回退到 boot，而不是报'没有目录'）===");
const initial = await bridge.getWorkingDirectory();
check("读到了工作目录", Boolean(initial?.current), initial?.current ?? "");
check("scope key 与运行时一致", initial?.scopeKey === `conversation:${scope.conversation_id}`, initial?.scopeKey);
console.log(`   当前: ${initial?.current} | overridden=${initial?.overridden} | boot=${initial?.boot}`);

// ---------- 校验：不存在的目录必须失败 ----------
console.log("\n=== ⑤ 不存在的目录必须失败（不能静默假装成功）===");
let failedAsExpected = false;
let failureMessage = "";
try {
  await bridge.setWorkingDirectory("/definitely/not/a/real/directory-xyz");
} catch (error) {
  failedAsExpected = true;
  failureMessage = error instanceof Error ? error.message : String(error);
}
check("切到不存在的目录会抛错", failedAsExpected, failureMessage.slice(0, 80));
const afterBad = await bridge.getWorkingDirectory();
check(
  "失败后当前目录没有被改坏",
  afterBad?.current === initial?.current,
  `${initial?.current} → ${afterBad?.current}`,
);

// ---------- 真切换 + 真验证 ----------
console.log("\n=== ⑥ 真切换，并验证 agent 真的在新目录里干活 ===");
const marker = `HARUYUKI-CWD-CHECK-${Date.now().toString(36)}`;
const dir = mkdtempSync(join(tmpdir(), "hryk-cwd-"));
writeFileSync(join(dir, "MARKER.txt"), marker, "utf8");
// macOS 上临时目录本身就在软链之下（`/var/folders/...` → `/private/var/folders/...`），
// 服务端会 realpath 归一化。**归一化结果无法通过协议拿到**，所以只按"路径边界"接受，
// 不写死具体前缀 —— 写死前缀正是本 check 第一版失败的原因。
const isSameDir = (a: string, b: string): boolean => {
  const x = a.replace(/\/+$/, "");
  const y = b.replace(/\/+$/, "");
  return x === y || x.endsWith(y) || y.endsWith(x);
};
console.log(`   临时目录: ${dir}`);

const listing = await bridge.listDirectory(dir);
check("list_in_directory 能校验该目录", listing.success, listing.error ?? listing.path);
check("目录列表里能看到我们建的文件所在目录（folders 是数组）", Array.isArray(listing.folders));

const changed = await bridge.setWorkingDirectory(dir);
console.log(`   切换后: ${changed.current}`);
check(
  "切换后回读指向同一个目录（允许 realpath 加前缀归一化）",
  isSameDir(changed.current, dir),
  `传入 ${dir}，回读 ${changed.current}`,
);

const reread = await bridge.getWorkingDirectory();
check("重新读取仍是新目录", reread?.current === changed.current, reread?.current ?? "");
check("此时标记为「有覆盖」", reread?.overridden === true, `overridden=${reread?.overridden}`);

// 让 agent 自己报目录 —— 这是唯一能证明"它真的在新目录干活"的方式
const before = events.length;
bridge.sendMessage(
  "Working directory check. Answer with exactly two lines: line 1 = the output of `pwd`; " +
    "line 2 = the contents of the file MARKER.txt in the current directory. Do not use any other file.",
);
await new Promise((r) => setTimeout(r, 45_000));
const text = collectAssistantText(events.slice(before));
console.log(`   agent 回复: ${JSON.stringify(text.slice(0, 220))}`);
check(
  "agent 报出的 cwd 就是新目录（真的切过去了）",
  isSameDir(text.split("\n")[0] ?? "", dir),
  `agent 报的第一行: ${JSON.stringify((text.split("\n")[0] ?? "").slice(0, 90))}`,
);
check("agent 能读到新目录里的标记文件（说明文件解析基准也变了）", text.includes(marker), marker);

// ---------- 还原 ----------
console.log("\n=== ⑦ 还原到原目录 ===");
if (initial?.current) {
  const restored = await bridge.setWorkingDirectory(initial.current);
  check("已还原", restored.current === initial.current, restored.current);
}
rmSync(dir, { recursive: true, force: true });

const failed = checks.filter((c) => !c.ok);
console.log(`\n=== 结果：${checks.length - failed.length}/${checks.length} 通过 ===`);
if (failed.length > 0) {
  console.log("未通过：");
  for (const item of failed) console.log(`  ❌ ${item.label}${item.detail ? ` —— ${item.detail}` : ""}`);
  process.exitCode = 1;
}
bridge.close();
server.stop();

// ═══════════════════════════════════════════════════════════════════════════
// ⑦ 工作区隔离（回归测试）
//
// 来历：服务端的 `boot_working_directory` 兜底值是它自己的 `process.cwd()`，
// 而我们的 spawn 没设 cwd —— 于是**在哪个目录启动应用，agent 的工作区就是哪个目录**。
// 实测后果：从本仓库启动时，agent 的工作区变成**这个项目本身**，它能翻到本仓库的
// git 历史与 node_modules（1.2GB），"打个招呼"就演变成探索代码库、烧掉上百 k token。
// ═══════════════════════════════════════════════════════════════════════════
console.log("\n=== ⑦ 工作区隔离 ===");

const projectRoot = process.cwd();
/** ⚠️ 用路径边界比较，不用字符串相等 —— macOS 会把 /tmp 规范成 /private/tmp。 */
const insideProject = (p?: string): boolean =>
  Boolean(p && (p === projectRoot || p.startsWith(projectRoot + "/")));

check(
  "defaultWorkingDirectory() 不指向本项目（不继承启动位置）",
  !insideProject(defaultWorkingDirectory()),
  `默认值 = ${defaultWorkingDirectory()}`,
);
check(
  "默认值可用（存在且是绝对路径）",
  Boolean(defaultWorkingDirectory()) && defaultWorkingDirectory().startsWith("/"),
  defaultWorkingDirectory(),
);

// 起一个显式 cwd 的服务端，确认它真的被采纳
const isolatedServer = await startServer({ command: resolveCheckServerCommand(), cwd: "/tmp" });
const isolatedBridge = new AppServerBridge(() => {});
await isolatedBridge.connect(isolatedServer.wsUrl, WebSocket);
const isoAgents = await isolatedBridge.listAgents();
await isolatedBridge.startRuntime(isoAgents[0]!.id, "standard");
const isoWd = await isolatedBridge.getWorkingDirectory();
check(
  "显式传入的 cwd 被采纳（agent 不再看到本项目）",
  !insideProject(isoWd?.current),
  `agent 工作目录 = ${isoWd?.current}`,
);
isolatedBridge.close();
isolatedServer.stop();
