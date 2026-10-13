import { spawn } from "node:child_process";
import { resolveHaruyukiLauncher } from "./server-process";
import type { RecallCommandResult, RecallSettingValue } from "@/shared/ipc-contract";

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

/**
 * 单次子命令的硬超时。
 *
 * ⚠️ 原值是 **60 秒**，那是**灾难性的错误配置**：实测 `recall status` 稳定在
 * **0.4~0.5 秒**（连测 5 次），60 秒是 ~120 倍冗余。当 `RecallPanel` 的
 * `useEffect` 陷入无限循环时，每个泄漏的子进程要**赖满 60 秒**才死，
 * 于是堆到 **232 个**、负载 327、`kernel_task` 257%，整机卡死。
 *
 * 超时值的意义不只是"够不够用"，还包括"**出错时能多快恢复**"。对一个正常
 * 半秒完成的本地命令，15 秒（30 倍余量）已经足够宽容。
 */
const RECALL_TIMEOUT_MS = 15_000;

/**
 * 同时在跑的 recall 子进程上限。
 *
 * ⚠️ 这是**护栏，不是正常路径**。来历：`RecallPanel` 的一个 `useEffect` 把
 * 每次渲染都变引用的 `onRefresh` 放进了依赖，形成无限循环，每轮 spawn 一个
 * `recall status`。因为超时是 60 秒，进程一路堆到 **187 个**，负载冲到 286、
 * `kernel_task` 烧到 257%、macOS 触发 `spindump` 判定系统卡死。
 *
 * 修完那个循环之后这个上限理论上永远碰不到 —— 但**这类 bug 的代价是整个系统卡死**，
 * 所以宁可在这里硬性兜底：超过就立刻报错，而不是继续 spawn。
 */
const MAX_CONCURRENT_RECALL = 4;

/** 同一组参数的**进行中**请求：复用同一个 promise，避免重复 spawn。 */
const inFlight = new Map<string, Promise<RecallCommandResult>>();
let running = 0;

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
  const key = args.join("\u0000");

  // ① 同参数的请求已经在跑 → 直接复用，**不再 spawn**。
  const existing = inFlight.get(key);
  if (existing) return existing;

  // ② 并发上限 —— 触顶就明确报错，而不是继续堆进程。
  if (running >= MAX_CONCURRENT_RECALL) {
    return Promise.resolve({
      ok: false,
      output: "",
      error:
        `recall 子进程已达并发上限（${MAX_CONCURRENT_RECALL}），本次 \`${args.join(" ")}\` 未执行。` +
        `这通常意味着有代码在反复调用 recall —— 请报告此现象。`,
    });
  }

  const promise = spawnRecallCommand(args, options);
  inFlight.set(key, promise);
  running++;
  void promise.finally(() => {
    inFlight.delete(key);
    running--;
  });
  return promise;
}

function spawnRecallCommand(
  args: string[],
  options: RecallRunOptions,
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

// ---------------------------------------------------------------------------
// 设置写入（B1）
// ---------------------------------------------------------------------------

/** 非负整数的上界。上游只要求"非负安全整数"，这里给一个防手滑的合理上限。 */
const MAX_COUNT = 1_000_000;

function requireCount(knob: string, value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${knob} 需要一个非负整数（0 表示关闭），收到：${JSON.stringify(value)}`);
  }
  if (value > MAX_COUNT) {
    throw new Error(`${knob} 超出合理上限 ${MAX_COUNT}，收到：${value}`);
  }
  return value;
}

const DIVERSITY_MODES = ["none", "file", "split"] as const;
const DISPLAY_TIERS = ["silent", "summary", "full"] as const;

/**
 * 把界面传来的设置翻译成 CLI 参数，并在**spawn 之前**校验。
 *
 * 越界直接抛错、**不执行任何子命令** —— 这样非法输入根本到不了上游，
 * 也绝不会写进 `~/.haruyuki/settings.json`。上游自己还有第二道校验（实测
 * `limit abc` 会非零退出且不改设置），两道都留着。
 *
 * 边界刻意与上游一致（**不自己发明**）：`ratio` 超出 `[0,1]` 是**拒绝**而不是裁剪
 * ——上游的理由是 >1 意味着"任何分数都过不了门槛"，静默裁剪会让 recall 被无声关掉。
 */
export function toRecallArgs(setting: RecallSettingValue): string[] {
  switch (setting.knob) {
    case "enabled": {
      // 先取到局部变量再判断：直接写 `typeof setting.value !== "boolean"` 会让
      // TS 把整个 `setting` 收窄成 `never`（判别联合的成员本来就只有 boolean），
      // 于是 if 分支里的 `setting.value` 取不到。
      const value: unknown = setting.value;
      if (typeof value !== "boolean") {
        throw new Error(`enabled 需要布尔值，收到：${JSON.stringify(value)}`);
      }
      // `on` 在上游还会**清断路器**（那是跳闸后唯一的人工恢复手段），所以刻意用
      // on/off 而不是写 recallEnabled 字段。
      return [value ? "on" : "off"];
    }

    case "timeout":
      return ["timeout", String(requireCount("timeout", setting.value))];
    case "dedup":
      return ["dedup", String(requireCount("dedup", setting.value))];
    case "limit":
      return ["limit", String(requireCount("limit", setting.value))];
    case "excerpt":
      return ["excerpt", String(requireCount("excerpt", setting.value))];

    case "chars": {
      const perEntry = requireCount("chars(单条)", setting.value?.perEntry);
      const total = requireCount("chars(总预算)", setting.value?.total);
      return ["chars", String(perEntry), String(total)];
    }

    case "ratio": {
      const value = setting.value;
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
        throw new Error(`ratio 需要 0 到 1 之间的数，收到：${JSON.stringify(value)}`);
      }
      return ["ratio", String(value)];
    }

    case "diversity":
      if (!DIVERSITY_MODES.includes(setting.value)) {
        throw new Error(`diversity 只能是 ${DIVERSITY_MODES.join(" / ")}，收到：${JSON.stringify(setting.value)}`);
      }
      return ["diversity", setting.value];

    case "display":
      if (!DISPLAY_TIERS.includes(setting.value)) {
        throw new Error(`display 只能是 ${DISPLAY_TIERS.join(" / ")}，收到：${JSON.stringify(setting.value)}`);
      }
      return ["display", setting.value];

    default: {
      // 穷尽性检查：以后加了旋钮但忘了在这里处理，`tsc` 会在这个实参上报错。
      return assertNever(setting, "未知的 recall 设置");
    }
  }
}

/** 编译期穷尽性断言：走到这里说明联合类型还有没处理的成员。 */
function assertNever(value: never, label: string): never {
  throw new Error(`${label}：${JSON.stringify(value)}`);
}
