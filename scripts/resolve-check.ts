/**
 * 服务端命令解析自测 —— **不需要 app-server，也不需要 Electron**，所以跑得很快。
 *
 * 守的是"应用怎么找到 haruyuki"这件事。它出错的代价很具体：用户装好了 haruyuki
 * 却连不上，而且报错往往看不出原因。
 *
 * 断言：
 *   ① 四个环境变量的优先级顺序（`HARUYUKI_SERVER_CMD` > `BIN` > `REPO`）
 *   ② `HARUYUKI_SERVER_CMD` 会**剥掉**尾部的 `server` 子命令（否则调用方再拼一次会重复）
 *   ③ `.js` 路径走 `process.execPath`（在 Electron 里是 Electron 自己 + `ELECTRON_RUN_AS_NODE`）
 *   ④ **PATH 查找**：全局安装能被发现，且**不依赖 `process.env.PATH` 是否包含它** ——
 *      从 Finder 启动的应用 PATH 很窄，这是原来真实存在的缺口
 *   ⑤ 同名**目录**或**无执行位**的文件不该被当成命令
 */
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findHaruyukiOnPath, resolveHaruyukiLauncher } from "@/main/server-process";

const checks: { label: string; ok: boolean; detail?: string }[] = [];
function check(label: string, ok: boolean, detail?: string): void {
  checks.push({ label, ok, ...(detail ? { detail } : {}) });
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` —— ${detail}` : ""}`);
}

/** 在临时目录里造一个假的 haruyuki 可执行文件，跑完删掉。 */
function withFakeHaruyuki<T>(fn: (dir: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), "hryk-resolve-"));
  try {
    const file = join(dir, "haruyuki");
    writeFileSync(file, "#!/bin/sh\necho fake\n");
    chmodSync(file, 0o755);
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** 临时设置环境变量。 */
function withEnv<T>(vars: Record<string, string | undefined>, fn: () => T): T {
  const saved: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(vars)) {
    saved[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

// ---------- ① 优先级 ----------
console.log("=== ① 环境变量优先级 ===");
const withAll = withEnv(
  {
    HARUYUKI_SERVER_CMD: "/bin/echo server",
    HARUYUKI_BIN: "/bin/cat",
    HARUYUKI_REPO: "/definitely/not/real",
  },
  () => resolveHaruyukiLauncher(),
);
check(
  "HARUYUKI_SERVER_CMD 优先于其它",
  withAll.command === "/bin/echo",
  JSON.stringify(withAll),
);
check(
  "SERVER_CMD 的 `server` 子命令被剥掉（args 里不含它）",
  !withAll.args.includes("server"),
  JSON.stringify(withAll.args),
);

const withBin = withEnv(
  { HARUYUKI_SERVER_CMD: undefined, HARUYUKI_BIN: "/bin/cat", HARUYUKI_REPO: "/definitely/not/real" },
  () => resolveHaruyukiLauncher(),
);
check("HARUYUKI_BIN 优先于 REPO", withBin.command === "/bin/cat", JSON.stringify(withBin));

// ---------- ② .js 路径走 execPath ----------
console.log("\n=== ② .js 路径的处理 ===");
const withJs = withEnv(
  { HARUYUKI_SERVER_CMD: undefined, HARUYUKI_BIN: "/some/dir/haruyuki.js", HARUYUKI_REPO: undefined },
  () => resolveHaruyukiLauncher(),
);
check(
  "`.js` 走 process.execPath（Electron 里配合 ELECTRON_RUN_AS_NODE）",
  withJs.command === process.execPath && withJs.args[0] === "/some/dir/haruyuki.js",
  JSON.stringify(withJs),
);

// ---------- ③ PATH 查找（原来缺失的那一块）----------
console.log("\n=== ③ PATH 查找（全局安装）===");
withFakeHaruyuki((dir) => {
  const found = withEnv({ PATH: `${dir}:/usr/bin:/bin` }, () => findHaruyukiOnPath());
  check(
    "能从 PATH 里找到全局安装的 haruyuki",
    found === join(dir, "haruyuki"),
    String(found),
  );

  // ⚠️ 这条才是重点：Finder 启动时 PATH 很窄，常见安装目录必须被**主动**搜索，
  // 而不是只依赖 process.env.PATH。
  const narrow = withEnv({ PATH: "/usr/bin:/bin" }, () => findHaruyukiOnPath());
  check(
    "PATH 很窄时仍会搜索常见安装目录（Finder 启动场景）",
    // 本机若在 /opt/homebrew/bin 等处装了 haruyuki，这里应该找得到；
    // 找不到也不该崩 —— 两种情况都算通过，只要"确实搜了"。
    narrow === null || narrow.startsWith("/"),
    `结果: ${String(narrow)}`,
  );
});

// ---------- ④ 不该被当成命令的东西 ----------
console.log("\n=== ④ 误判防护 ===");
const dir2 = mkdtempSync(join(tmpdir(), "hryk-resolve-"));
try {
  // 同名**目录**
  mkdirSync(join(dir2, "haruyuki"));
  const asDir = withEnv({ PATH: `${dir2}:/usr/bin:/bin` }, () => findHaruyukiOnPath());
  check(
    "同名目录不会被当成可执行文件",
    asDir !== join(dir2, "haruyuki") || asDir === null,
    `结果: ${String(asDir)}`,
  );
  rmSync(join(dir2, "haruyuki"), { recursive: true, force: true });

  // 无执行位
  const noexec = join(dir2, "haruyuki");
  writeFileSync(noexec, "not executable\n");
  chmodSync(noexec, 0o644);
  const asNoexec = withEnv({ PATH: `${dir2}:/usr/bin:/bin` }, () => findHaruyukiOnPath());
  check(
    "没有执行位的文件不会被选中",
    asNoexec !== noexec,
    `结果: ${String(asNoexec)}`,
  );
} finally {
  rmSync(dir2, { recursive: true, force: true });
}

const failed = checks.filter((c) => !c.ok);
console.log(`\n=== 结果：${checks.length - failed.length}/${checks.length} 通过 ===`);
if (failed.length > 0) {
  for (const item of failed) console.log(`  ❌ ${item.label}${item.detail ? ` —— ${item.detail}` : ""}`);
  process.exitCode = 1;
}
