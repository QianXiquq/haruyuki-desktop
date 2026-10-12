import { spawn } from "node:child_process";
import { resolveHaruyukiLauncher } from "./server-process";
import type { RecallCommandResult } from "@/shared/ipc-contract";

/**
 * 驱动 `haruyuki recall …` 子命令。
 *
 * ## 为什么是 spawn 子进程，而不是走 WebSocket 协议
 *
 * recall 在协议层**完全没有命令**（`git grep recall src/types/protocol_v2.ts` 为空）——
 * 它是**服务端被动行为**：每轮发送前自动检索历史会话与 MemFS 记忆文件，命中就注入。
 * 而配置、状态、试搜、建索引这些能力，上游只开在 **CLI 子命令**上：
 *
 * ```
 * haruyuki recall <build|status|now|on|off|timeout|dedup|limit|excerpt|chars|ratio|diversity|display>
 * ```
 *
 * 上游源码原话：**"任何其它 `/recall` 子命令在这里也能用，所以脚本可以设置旋钮"**。
 * 所以 GUI 走 CLI 就能与 TUI **完全对等**，且**零 fork、零协议改动**。
 *
 * ## 实测确认过的行为（别重复踩）
 *
 * - **无 TTY、stdin 关闭也能跑**，并且**会自己退出**（不会挂住 GUI）
 * - 非法参数（如 `limit abc`）非零退出**且不改写设置** —— 复核后 `Recall: on` 未变
 * - `build` **幂等**：已满覆盖时重跑只是 28ms 重写一遍
 *
 * ## ⚠️ 索引为空 = recall **静默失效**
 *
 * 没有索引时查询返回 `no-match`，走的是**正常路径**而**不**是 degraded，
 * 因此**不会发任何通知**。用户只会看到"agent 没答上之前聊过的事"，没有任何线索。
 * 上游给的唯一自救办法就是 `haruyuki recall build` —— 那是 TUI 命令，
 * **GUI 用户没有它就永远好不了**。这就是本模块存在的理由。
 */

/** 单次子命令的硬超时。实测 `status`/`build` 都是毫秒级，给足余量即可。 */
const RECALL_TIMEOUT_MS = 60_000;

export interface RecallRunOptions {
  timeoutMs?: number;
}

/**
 * 跑一条 recall 子命令。
 *
 * 失败**不抛异常**，而是返回 `{ ok: false, error }` —— 调用方（IPC）会把它原样交给
 * 界面显示。这里刻意不用"抛错"表达失败，因为界面上要同时展示**命令原文输出**
 * （用户看到的上游报错信息比我们转述的更有用）。
 */
export function runRecallCommand(
  args: string[],
  options: RecallRunOptions = {},
): Promise<RecallCommandResult> {
  const timeoutMs = options.timeoutMs ?? RECALL_TIMEOUT_MS;
  const launcher = resolveHaruyukiLauncher();

  return new Promise<RecallCommandResult>((resolve) => {
    let stdout = "";
    let stderr = "";
    let settled = false;

    const child = spawn(launcher.command, [...launcher.args, "recall", ...args], {
      // stdin 直接关闭：recall 是**非交互**子命令。留着一个打开的 stdin 有让
      // 子进程等输入而挂住的风险（上游的 `haruyuki recall` 不带参数会开设置选择器，
      // 那才是交互的 —— 我们永远不会不带子命令调用）。
      stdio: ["ignore", "pipe", "pipe"],
      // 与 server-process.ts 同理：在 Electron 里 process.execPath 是 Electron 自己，
      // 需要这个变量才以 Node 身份运行 haruyuki.js。
      env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
    });

    const finish = (result: RecallCommandResult): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      finish({
        ok: false,
        output: `${stdout}${stderr}`.trim(),
        error: `haruyuki recall ${args.join(" ")} 超时（${timeoutMs}ms）已终止`,
      });
    }, timeoutMs);

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      finish({ ok: false, output: "", error: `无法启动 haruyuki：${error.message}` });
    });

    child.on("close", (code) => {
      // stdout 与 stderr 合并：上游把不同信息写到不同流（报错去 stderr、
      // 正常结果去 stdout），分成两段显示反而难读。
      const output = `${stdout}${stderr}`.trim();
      if (code === 0) {
        finish({ ok: true, output });
      } else {
        finish({ ok: false, output, error: `haruyuki recall ${args.join(" ")} 退出码 ${code}` });
      }
    });
  });
}

/**
 * 把 `haruyuki recall status` 的输出解析成界面要用的少量字段。
 *
 * 实现放在 `shared/ipc-contract.ts`（渲染进程也要用它），这里只做转出，
 * 方便主进程侧的调用点就近 import。
 */
export { parseRecallStatus } from "@/shared/ipc-contract";
