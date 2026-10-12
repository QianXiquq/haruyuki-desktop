/**
 * 三个 check 脚本共用的"服务端该用哪个构建产物"解析。
 *
 * 单独成一个模块，是为了堵住一个曾经真实存在的漏洞：脚本原先各自硬编码
 * `HARUYUKI_REPO ?? "/Users/qianxiquq/haruyuki"`，也就是**永远指向那个 0.1.3 的
 * 旧 checkout**。于是"升级到 0.2.0 后跑 check 全绿"可能是假绿 —— 实际测的还是
 * 0.1.3。现在统一走 `src/main/server-process.ts` 的解析逻辑，与 GUI **同一份**，
 * 并且解析不出来时**直接报错**，而不是静默退到某个可能不存在的路径。
 *
 * 覆盖方式（优先级见 `resolveServerCommand`）：
 *   1. `HARUYUKI_SERVER_CMD` —— 完整命令行，须自带 `server` 子命令
 *   2. `HARUYUKI_BIN`
 *   3. `HARUYUKI_REPO` / 上游参考仓 `~/haruyuki-upstream`
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { defaultServerBuild, resolveServerCommand, type ServerCommand } from "@/main/server-process";

const ARTIFACT_NAME = "haruyuki.js";

/**
 * 解析出**这一次 check 要用的**服务端命令。
 *
 * 与 `resolveServerCommand()` 的区别只有一个：解析不出来时**抛错**。
 * GUI 可以静默落到 `node_modules/.bin`（那是运行时兜底），但自测必须响亮地失败 ——
 * 否则"测过了"这句话就没有意义。
 */
export function resolveCheckServerCommand(): ServerCommand {
  const explicit = process.env.HARUYUKI_SERVER_CMD?.trim();
  if (explicit) {
    const [head, ...tail] = explicit.split(/\s+/);
    return { command: head as string, args: tail };
  }

  const fromBin = process.env.HARUYUKI_BIN?.trim();
  if (fromBin) {
    return /\.(js|cjs|mjs)$/.test(fromBin)
      ? { command: process.execPath, args: [fromBin, "server"] }
      : { command: fromBin, args: ["server"] };
  }

  const build = defaultServerBuild();
  if (build) return { command: process.execPath, args: [build, "server"] };

  const repoHint = process.env.HARUYUKI_REPO ?? join(process.env.HOME ?? "~", "haruyuki-upstream");
  throw new Error(
    [
      `找不到 haruyuki 服务端构建产物（期望 ${join(repoHint, ARTIFACT_NAME)}）。`,
      "",
      "构建方式：",
      `  git clone --filter=blob:none https://github.com/TZYLT/haruyuki.git ${repoHint}`,
      `  cd ${repoHint} && git checkout v0.2.0`,
      '  export PATH="$HOME/.bun/bin:$PATH"   # 构建脚本内部会调 bun，必须在 PATH 上',
      "  bun install --frozen-lockfile && bun run build",
      "",
      "或显式指定：HARUYUKI_SERVER_CMD='node /path/to/haruyuki.js server' bun run check:integration",
    ].join("\n"),
  );
}

/** 人话描述这次实际测的是哪个产物 —— 打进日志，作为"测的是哪一版"的证据。 */
export function describeCheckServer(command: ServerCommand): string {
  const artifact = [command.command, ...command.args].find((part) => /\.(js|cjs|mjs)$/.test(part));
  if (!artifact || !existsSync(artifact)) return `${command.command} ${command.args.join(" ")}`;
  return artifact;
}

/** 兜底导出，便于脚本在自定义路径时复用同一套优先级。 */
export { resolveServerCommand };
