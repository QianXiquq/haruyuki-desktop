/**
 * 验证里程碑 1 里最后两项：审批卡片链路与中断。
 *
 * 关键前提：服务端默认权限模式是 `unrestricted`（一律自动放行，不弹审批）。
 * 必须显式用 `mode: "standard"` 才会出现 control_request。
 */
import WebSocket from "ws";
import { AppServerBridge } from "@/main/app-server";
import { startServer } from "@/main/server-process";
import type { HaruyukiEvent } from "@/shared/ipc-contract";

process.env.HARUYUKI_SERVER_CMD ??=
  `node ${process.env.HARUYUKI_REPO ?? "/Users/qianxiquq/haruyuki"}/haruyuki.js server`;

const events: HaruyukiEvent[] = [];
const seenFrameTypes = new Set<string>();
const seenMessageTypes = new Set<string>();
let autoApproved = 0;

const server = await startServer();
console.log("① 服务端:", server.wsUrl);

const rawClient = { current: null as unknown as { onMessage: (h: (m: unknown) => void) => void } };
void rawClient;

const bridge = new AppServerBridge((event) => {
  events.push(event);
  switch (event.kind) {
    case "assistant_delta":
      if (event.text) process.stdout.write(event.text);
      return;
    case "tool_call":
      console.log(`\n   [tool_call] ${event.name} ${JSON.stringify(event.input).slice(0, 120)}`);
      return;
    case "tool_return":
      console.log(`   [tool_return] ${event.output.slice(0, 160)}`);
      return;
    case "approval_request":
      autoApproved += 1;
      console.log(`\n   🔔 [approval_request] ${event.toolName} → 自动回复 allow`);
      bridge.respondApproval(event.requestId, "allow");
      return;
    case "error":
      console.log("\n   [error]", event.message);
      return;
    case "turn_finished":
      console.log(`\n   [turn_finished] stop_reason=${event.stopReason ?? "(none)"}`);
      return;
    default:
      return;
  }
});

const protocolVersion = await bridge.connect(server.wsUrl, WebSocket);
bridge.current.onMessage((message: unknown) => {
  const frame = message as { type?: string; delta?: { type?: string; message_type?: string } };
  if (frame.type) seenFrameTypes.add(frame.type);
  if (frame.type === "stream_delta" && frame.delta?.message_type) {
    seenMessageTypes.add(frame.delta.message_type);
  }
});
// 原始帧全量监听（绕过 bridge 的收敛，看协议实际长什么样）
bridge.current.onMessage((message: unknown) => {
  const frame = message as { type?: string; delta?: Record<string, unknown> };
  if (frame.type !== "stream_delta") return;
  const mt = String(frame.delta?.message_type ?? "");
  if (mt === "tool_call_message" || mt === "tool_return_message" || mt === "approval_request_message") {
    console.log(`   [RAW ${mt}] ${JSON.stringify(frame.delta).slice(0, 400)}`);
  }
});
console.log(`② 已连接 protocol=v${protocolVersion}`);

const agents = await bridge.listAgents();
const first = agents[0];
if (!first) throw new Error("没有可用 agent");

// 关键：用 standard 模式，否则不会有审批
const runtime = await bridge.startRuntime(first.id, "standard");
console.log(`③ runtime_start(standard): ${JSON.stringify(runtime)}`);

console.log("④ 触发工具调用，观察审批卡片…");
console.log("   ---");
bridge.sendMessage("Use the Bash tool to run exactly: touch /tmp/haruyuki-approval-test.txt");
await new Promise((resolve) => setTimeout(resolve, 45_000));
console.log("\n   ---");

// ---------- 中断测试 ----------
console.log("\n⑤ 中断测试：发一条会持续输出的请求，1.5 秒后 abort");
const before = events.length;
bridge.sendMessage("Count slowly from 1 to 200, one number per line.");
await new Promise((resolve) => setTimeout(resolve, 1500));
await bridge.interrupt();
await new Promise((resolve) => setTimeout(resolve, 6000));
const after = events.slice(before);

console.log("\n=== 断言 ===");
console.log(autoApproved > 0 ? `✅ 收到并回复了 ${autoApproved} 次审批请求` : "❌ 未出现审批请求");
console.log(events.some((e) => e.kind === "tool_call") ? "✅ 有工具调用" : "❌ 无工具调用");
console.log(
  events.some((e) => e.kind === "tool_return") ? "✅ 有工具结果（审批放行后真的执行了）" : "❌ 无工具结果",
);
console.log(
  after.some((e) => e.kind === "turn_finished") ? "✅ 中断后回合正常终止" : "⚠️ 中断后未见 turn_finished",
);
const text = events
  .filter((e): e is Extract<HaruyukiEvent, { kind: "assistant_delta" }> => e.kind === "assistant_delta")
  .map((e) => e.text)
  .join("");
console.log("assistant 累计正文长度:", text.length);
console.log("\n见过的帧类型:", [...seenFrameTypes].sort().join(", "));
console.log("见过的 message_type:", [...seenMessageTypes].sort().join(", "));

bridge.close();
server.stop();
