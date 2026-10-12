/**
 * 记忆（MemFS）自测（P1 第 6 项）。
 *
 * ⚠️ **本 check 会写一个临时文件再删掉，全程不碰你已有的记忆文件**（用 `__check__-` 前缀）。
 *
 * 这条 check 记录了记忆的几个**真实约束**（都是踩出来的）：
 *   ① `list_memory` 一次返回全部条目，但它的 `content` **已被剥掉 frontmatter**
 *   ② `read_memory_file` 给的是**含 frontmatter 的完整原文** —— 编辑必须用它
 *   ③ 写入没有 frontmatter 的 markdown **会被记忆校验拒绝**，且**文件仍会落到工作区**
 *   ④ 合规写入会产生一次提交（所以写错能靠历史找回）
 *   ⑤ 路径逃逸（`../`）被服务端拒绝
 *   ⑥ 清理必须成功（这类"验证的副作用"由 check 自己负责）
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

const agents = await bridge.listAgents();
// ⚠️ 不要盲目用 agents[0]：列表按名字排序，测试 agent 会排在前面，
// 于是会往"不是你在用的" agent 里写文件。优先用 Tutor。
const agent = agents.find((a) => a.name === "Tutor") ?? agents[0]!;
const agentId = agent.id;
console.log("agent:", agent.name ?? "(无名)", agentId);
if (agents.length !== 1) {
  console.log(`   ⚠️ 当前有 ${agents.length} 个 agent，本 check 只操作上面这个`);
}

const TEST_PATH = "__check__-memory.md";
const MARKER = `记忆自测正文 ${Date.now().toString(36)}`;
/** 合规内容：markdown 必须以 frontmatter 开头。 */
const VALID = `---\nname: Check\ndescription: temporary file written by check:memory\n---\n${MARKER}\n`;

const pathsBefore = (await bridge.listMemory(agentId)).files.map((f) => f.path).sort();

// ---------- ① list 的形状 ----------
console.log("\n=== ① list_memory 的形状 ===");
const snap = await bridge.listMemory(agentId);
check("能列出记忆文件", snap.files.length > 0, `${snap.files.length} 个`);
check("MemFS 已启用", snap.memfsEnabled, `enabled=${snap.memfsEnabled} initialized=${snap.memfsInitialized}`);
check(
  "条目自带 content（不必逐文件再读）",
  snap.files.every((f) => typeof f.content === "string"),
);
console.log("   现有文件:", snap.files.map((f) => f.path).join(", "));

// ---------- ② list 的 content 是剥过的；read 才是原文 ----------
console.log("\n=== ② 关键区别：list 的 content 已被剥掉 frontmatter ===");
const mdFile = snap.files.find((f) => f.kind === "markdown" && !f.isSystem) ?? snap.files.find((f) => f.kind === "markdown");
if (mdFile) {
  const rawText = await bridge.readMemoryFile(agentId, mdFile.path);
  console.log(`   ${mdFile.path}: list.content ${mdFile.content.length} 字符 / read 原文 ${rawText.length} 字符`);
  check(
    "read_memory_file 返回的是含 frontmatter 的完整原文",
    rawText.startsWith("---"),
    JSON.stringify(rawText.slice(0, 40)),
  );
  check(
    "read 比 list 的 content 更长（差的就是 frontmatter）",
    rawText.length > mdFile.content.length,
    `${rawText.length} > ${mdFile.content.length}`,
  );
  check("list 的 content **不含** frontmatter（所以不能拿它保存）", !mdFile.content.startsWith("---"));
} else {
  check("（没有可用的 markdown 文件做对比，跳过）", true);
}

// ---------- ③ 丢 frontmatter 的写入必须被拒 ----------
console.log("\n=== ③ 没有 frontmatter 的写入必须被记忆校验拒绝 ===");
let badRejected = false;
let badMsg = "";
try {
  await bridge.writeMemoryFile(agentId, TEST_PATH, MARKER, "无 frontmatter 自测");
} catch (e) {
  badRejected = true;
  badMsg = e instanceof Error ? e.message : String(e);
}
check("被拒绝", badRejected, badMsg.replace(/\s+/g, " ").slice(0, 120));
check(
  "报错说明了原因（missing frontmatter）",
  /frontmatter/i.test(badMsg),
  badMsg.replace(/\s+/g, " ").slice(0, 120),
);
// ⚠️ 提交被拒时文件可能已落到工作区 —— 所以下面无论如何都要清理
const afterBad = (await bridge.listMemory(agentId)).files.map((f) => f.path);
console.log(
  afterBad.includes(TEST_PATH)
    ? "   ⚠️ 已被拒绝但文件出现在工作区（说明写入是「部分成功」，必须清理）"
    : "   （被拒后没有留下文件）",
);

// ---------- ④ 合规写入成功并产生提交 ----------
console.log("\n=== ④ 合规写入（带 frontmatter）===");
let goodWrite = true;
try {
  await bridge.writeMemoryFile(agentId, TEST_PATH, VALID, "GUI 记忆自测");
} catch (e) {
  goodWrite = false;
  console.log("   写入失败:", (e instanceof Error ? e.message : String(e)).replace(/\s+/g, " ").slice(0, 140));
}
check("带 frontmatter 的写入成功", goodWrite);
if (goodWrite) {
  const after = await bridge.listMemory(agentId);
  const written = after.files.find((f) => f.path === TEST_PATH);
  check("新文件出现在列表里", written !== undefined, TEST_PATH);
  check(
    "回读正文包含标记（frontmatter 被服务端剥掉，所以只比对正文）",
    written?.content.includes(MARKER) === true,
    JSON.stringify(written?.content?.slice(0, 60)),
  );
  const rawWritten = await bridge.readMemoryFile(agentId, TEST_PATH);
  check("原文以 frontmatter 开头", rawWritten.startsWith("---"));

  const history = await bridge.memoryHistory(agentId, TEST_PATH, 20);
  check("写入产生了一次提交（写错能找回的依据）", history.length > 0, `${history.length} 条`);
  console.log("   " + history.slice(0, 2).map((c) => `${c.hash.slice(0, 8)} ${c.message ?? "(无说明)"}`).join("\n   "));
}

// ---------- ⑤ 路径逃逸 ----------
console.log("\n=== ⑤ 路径逃逸必须被拒 ===");
let escaped = false;
let escapeMsg = "";
try {
  await bridge.writeMemoryFile(agentId, "../../escaped-check.md", "x");
} catch (e) {
  escaped = true;
  escapeMsg = e instanceof Error ? e.message : String(e);
}
check("写入 `../../` 被拒绝", escaped, escapeMsg.replace(/\s+/g, " ").slice(0, 100));

// ---------- ⑥ 清理 ----------
console.log("\n=== ⑥ 清理（副作用自己收拾）===");
try {
  await bridge.deleteMemoryFile(agentId, TEST_PATH, "清理 GUI 记忆自测");
} catch (e) {
  console.log(`   删除报错（用下面的列表断言它是否真的清掉）：${(e instanceof Error ? e.message : String(e)).replace(/\s+/g, " ").slice(0, 100)}`);
}
const pathsAfter = (await bridge.listMemory(agentId)).files.map((f) => f.path).sort();
check("临时文件已从列表移除", !pathsAfter.includes(TEST_PATH));
check(
  "记忆文件列表恢复原状",
  JSON.stringify(pathsAfter) === JSON.stringify(pathsBefore),
  `${pathsBefore.length} → ${pathsAfter.length} 个`,
);
if (JSON.stringify(pathsAfter) !== JSON.stringify(pathsBefore)) {
  console.log(`   ⚠️ 残留：${TEST_PATH}`);
}
check("逃逸测试没有留下痕迹", !pathsAfter.some((p) => p.includes("escaped")));

const failed = checks.filter((c) => !c.ok);
console.log(`\n=== 结果：${checks.length - failed.length}/${checks.length} 通过 ===`);
if (failed.length > 0) {
  for (const item of failed) console.log(`  ❌ ${item.label}${item.detail ? ` —— ${item.detail}` : ""}`);
  process.exitCode = 1;
}
bridge.close();
server.stop();
