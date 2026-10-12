/**
 * 端到端联调：直接驱动主进程真正使用的两个模块，不需要 Electron。
 *
 * 覆盖 runtime_start → input → stream_delta → turn_finished 全链路，
 * 并断言 assistant 正文能被正确提取（extractText 对付的是数组形式的 content）。
 *
 * 注意：会真实调用一次模型，产生极少量的 token 费用。
 */
import WebSocket from "ws";
import { AppServerBridge } from "@/main/app-server";
import { startServer } from "@/main/server-process";
import type { HaruyukiEvent } from "@/shared/ipc-contract";
import { describeCheckServer, resolveCheckServerCommand } from "./server-command";
import { assistantTextOf, collectAssistantText } from "./event-text";


const SERVER_CMD = resolveCheckServerCommand();
console.log("服务端产物:", describeCheckServer(SERVER_CMD));

const events: HaruyukiEvent[] = [];
const server = await startServer({ command: SERVER_CMD });
console.log("① 服务端已启动:", server.wsUrl);

const bridge = new AppServerBridge((event) => {
  events.push(event);
  // 批处理后的增量（逐 token 事件已被合并，见 event-text.ts 的说明）。
  const live = assistantTextOf(event);
  if (live) process.stdout.write(live);
  if (event.kind === "error") console.log("\n   [error]", event.message);
});

const protocolVersion = await bridge.connect(server.wsUrl, WebSocket);
console.log(`② 已连接 protocol=v${protocolVersion}`);

const agents = await bridge.listAgents();
console.log(`③ agents: ${agents.map((a) => a.name ?? a.id).join(", ")}`);
const first = agents[0];
if (!first) throw new Error("没有可用 agent");

const runtime = await bridge.startRuntime(first.id);
console.log(`④ runtime_start 成功: ${JSON.stringify(runtime)}`);

console.log("⑤ 发送消息，等待流式回复…");
console.log("   ---");
bridge.sendMessage("Reply with exactly: PONG");
await new Promise((resolve) => setTimeout(resolve, 30_000));
console.log("\n   ---");

const assistantText = collectAssistantText(events);

console.log("\n=== 断言 ===");
console.log("assistant 正文:", JSON.stringify(assistantText));
console.log(assistantText.includes("PONG") ? "✅ extractText 正确（正文非空）" : "❌ 正文为空/错误");
console.log(events.some((e) => e.kind === "turn_finished") ? "✅ 收到 turn_finished" : "❌ 未收到 turn_finished");
console.log(events.some((e) => e.kind === "error") ? "❌ 出现错误事件" : "✅ 无错误事件");

bridge.close();
server.stop();
