/**
 * P1 端到端联调：会话列表 → 恢复会话 → 历史消息。
 *
 * 与另两个 check 一样直接驱动主进程真正使用的模块（不需要 Electron）。
 *
 * 断言的都是"读文档看不出来、只有跑真实流量才知道"的点：
 *   ① `conversation_list` 有数据，且标题能从最早的真实用户发言推导出来
 *      （system-reminder 必须被剥掉，否则标题是一屏噪音）
 *   ② `runtime_start { conversation_id }` 真的复用同一个 id，而不是新建
 *   ③ 历史消息能取回来，且**顺序是旧 → 新**（服务端给的是 desc，必须反转）
 *   ④ user / assistant / reasoning / tool_call 都被正确分类
 *   ⑤ tool_return_message 通过 tool_call_id 回填到了对应的工具卡片上
 *
 * 注意：会真实调用一次模型，产生极少量的 token 费用。
 */
import WebSocket from "ws";
import { AppServerBridge, deriveConversationTitle, toChatItems, toChatItemsWithDate } from "@/main/app-server";
import { startServer } from "@/main/server-process";
import type { HaruyukiEvent } from "@/shared/ipc-contract";
import { describeCheckServer, resolveCheckServerCommand } from "./server-command";
import { collectAssistantText } from "./event-text";


const checks: { label: string; ok: boolean; detail?: string }[] = [];
function check(label: string, ok: boolean, detail?: string): void {
  checks.push({ label, ok, ...(detail ? { detail } : {}) });
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` —— ${detail}` : ""}`);
}

const SERVER_CMD = resolveCheckServerCommand();
console.log("服务端产物:", describeCheckServer(SERVER_CMD));

const events: HaruyukiEvent[] = [];
const server = await startServer({ command: SERVER_CMD });
console.log("① 服务端已启动:", server.wsUrl);

const bridge = new AppServerBridge((event) => events.push(event));
const protocolVersion = await bridge.connect(server.wsUrl, WebSocket);
console.log(`② 已连接 protocol=v${protocolVersion}`);

const agents = await bridge.listAgents();
const agent = agents[0];
if (!agent) throw new Error("没有可用 agent");
console.log(`③ agent: ${agent.name ?? agent.id}`);

// ---------- 0. 先造一个已知内容的会话，避免依赖机器上恰好有什么 ----------
// 修复前的行为是"每次进来都新建会话"，所以这里新建一个再恢复它，正好覆盖两条路径。
console.log("\n④ 新建会话并说一句可识别的话…");
const created = await bridge.startRuntime(agent.id, "standard");
console.log(`   runtime_start（不带 conversation_id）→ ${created.conversation_id}`);
const MARKER = `P1 会话恢复自测 ${Date.now().toString(36)}`;
bridge.sendMessage(`Reply with exactly: ACK. (${MARKER})`);
await new Promise((resolve) => setTimeout(resolve, 35_000));

const assistantText = collectAssistantText(events);
check("新会话收到了 assistant 正文", assistantText.trim().length > 0, JSON.stringify(assistantText.slice(0, 60)));

// ---------- 1. 会话列表 ----------
console.log("\n=== 断言 ① 会话列表 ===");
const listed = await bridge.listConversations();
check("conversation_list 返回了会话", listed.length > 0, `${listed.length} 个`);
check(
  "刚建的会话出现在列表里",
  listed.some((c) => c.id === created.conversation_id),
  created.conversation_id,
);

const target = listed.find((c) => c.id === created.conversation_id);
check("会话带上了消息条数", (target?.messageCount ?? 0) > 0, `messageCount=${target?.messageCount}`);
check("会话标题推导成功", Boolean(target?.title), JSON.stringify(target?.title));
check(
  "标题剥掉了 system-reminder（不是噪音）",
  !(target?.title ?? "").includes("system-reminder") && !(target?.title ?? "").includes("automated message"),
  JSON.stringify(target?.title),
);

// 直接对 Title 函数做一次单元级的反向验证：全是自动化消息时必须推不出标题
check(
  "纯自动化消息不会产生标题",
  deriveConversationTitle([
    {
      message_type: "user_message",
      content: [{ type: "text", text: "<system-reminder>env info</system-reminder>" }],
    },
  ]) === undefined,
);

// ---------- 2. 恢复会话 ----------
console.log("\n=== 断言 ② 恢复同一个会话 ===");
const restored = await bridge.startRuntime(agent.id, "standard", created.conversation_id);
check(
  "runtime_start 复用了传入的 conversation_id（没有新建）",
  restored.conversation_id === created.conversation_id,
  `${created.conversation_id} → ${restored.conversation_id}`,
);

const afterRestore = await bridge.listConversations();
check(
  "恢复没有产生新的会话（会话总数没变）",
  afterRestore.length === listed.length,
  `${listed.length} → ${afterRestore.length}`,
);

// ---------- 3. 历史消息 ----------
console.log("\n=== 断言 ③④⑤ 历史消息 ===");
const history = await bridge.loadConversation(restored.conversation_id);
check("历史消息非空", history.items.length > 0, `${history.items.length} 条`);

const kinds = history.items.map((i) => i.kind);
console.log("   条目 kind 序列:", kinds.join(", "));

check("历史里有 user 条目", kinds.includes("user"));
check("历史里有 assistant 条目", kinds.includes("assistant"));

const firstUser = history.items.find((i) => i.kind === "user");
check(
  "user 条目剥掉了 system-reminder",
  Boolean(firstUser) && !firstUser!.text.includes("system-reminder"),
  JSON.stringify(firstUser?.text.slice(0, 60)),
);
check(
  "历史里能找到刚才那句话",
  history.items.some((i) => i.kind === "user" && i.text.includes("ACK")),
);

// 顺序：用时间戳客观验证"旧 → 新"。不能靠"第一条是不是 user"这种启发式 ——
// 一个正常的会话本来就可能是 user, reasoning, assistant。
const dated = await bridge.rawConversationMessages(restored.conversation_id);
const orderedItems = toChatItemsWithDate(dated);
const dates = orderedItems.map((entry) => Date.parse(entry.date)).filter((t) => !Number.isNaN(t));
const monotonic = dates.every((time, index) => index === 0 || time >= dates[index - 1]!);
check(
  "历史顺序是旧 → 新（时间戳单调不减）",
  dates.length >= 2 && monotonic,
  dates.map((d) => new Date(d).toISOString().slice(11, 19)).join(" → "),
);

// 直接对 toChatItems 做一次反向验证：喂 desc 输入，必须吐出 asc 结果
const syntheticDesc = [
  {
    id: "m2",
    message_type: "assistant_message",
    date: "2026-01-01T00:00:02.000Z",
    content: [{ type: "text", text: "SECOND" }],
  },
  {
    id: "m1",
    message_type: "user_message",
    date: "2026-01-01T00:00:01.000Z",
    content: [{ type: "text", text: "FIRST" }],
  },
];
const syntheticItems = toChatItems(syntheticDesc);
check(
  "toChatItems 把 desc 输入反转成 旧→新",
  syntheticItems[0]?.kind === "user" && syntheticItems[1]?.kind === "assistant",
  syntheticItems.map((i) => i.kind).join(","),
);

// 0.2.0 的 recall 块也是一个 <system-reminder>：必须整块剥掉，只留真实用户文字。
// 这是刻意与 CLI 不同的取舍（CLI 保留它是为了渲染 `↩ recalled` 摘要行）——
// 见 src/main/app-server.ts 里 stripSystemReminders 的注释。
const recallOnly = toChatItems([
  {
    id: "rc1",
    message_type: "user_message",
    date: "2026-01-01T00:00:01.000Z",
    content: [
      {
        type: "text",
        text:
          '<system-reminder>\n<recall-injected items="2" transcript="1" memory="1" />\n' +
          "earlier conversation excerpt…\n</system-reminder>",
      },
    ],
  },
]);
check(
  "整条都是 recall 块的 user 消息被丢弃（不会渲染成空气泡）",
  recallOnly.length === 0,
  `${recallOnly.length} 条`,
);

const recallMixed = toChatItems([
  {
    id: "rc2",
    message_type: "user_message",
    date: "2026-01-01T00:00:01.000Z",
    content: [
      {
        type: "text",
        text:
          '<system-reminder>\n<recall-injected items="1" transcript="1" memory="0" />\n' +
          "old passage\n</system-reminder>",
      },
      { type: "text", text: "真正的用户问题" },
    ],
  },
]);
check(
  "recall 块被剥掉、真实用户文字保留",
  recallMixed.length === 1 && recallMixed[0]?.kind === "user" && recallMixed[0].text === "真正的用户问题",
  JSON.stringify(recallMixed.map((i) => (i.kind === "user" ? i.text : i.kind))),
);

// tool_return 回填：用一条 approval_request + 对应 tool_return 验证
const toolItems = toChatItems([
  {
    id: "r1",
    message_type: "tool_return_message",
    tool_call_id: "call_X",
    tool_return: "TOOL OUTPUT",
  },
  {
    id: "c1",
    message_type: "approval_request_message",
    tool_call: { tool_call_id: "call_X", name: "Bash", arguments: '{"command":"ls"}' },
  },
]);
const callItem = toolItems.find((i) => i.kind === "tool_call");
check(
  "tool_return 回填到了对应的工具卡片（不再是一条孤立通知）",
  callItem?.kind === "tool_call" && callItem.done && callItem.output === "TOOL OUTPUT",
  JSON.stringify(toolItems.map((i) => i.kind)),
);
check(
  "工具参数 JSON 字符串被解析成对象",
  callItem?.kind === "tool_call" && typeof callItem.input === "object" && callItem.input !== null,
  JSON.stringify(callItem?.kind === "tool_call" ? callItem.input : null),
);

// ---------- 汇总 ----------
const failed = checks.filter((c) => !c.ok);
console.log(`\n=== 结果：${checks.length - failed.length}/${checks.length} 通过 ===`);
if (failed.length > 0) {
  console.log("未通过：");
  for (const item of failed) console.log(`  ❌ ${item.label}${item.detail ? ` —— ${item.detail}` : ""}`);
}

bridge.close();
server.stop();

if (failed.length > 0) process.exitCode = 1;
