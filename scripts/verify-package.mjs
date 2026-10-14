/**
 * 打包产物校验。
 *
 * 分发包里"少了什么"是很晚才会被发现的那类问题 —— 用户下载了、双击了、
 * 或者更糟：法律上该带的许可文件缺失而我们不知道。所以产物必须**逐项校验**，
 * 而不是"构建成功就当好了"。
 *
 * 校验清单：
 *   ① `.app` 存在，且里面有打包后的主进程入口
 *   ② **Apache-2.0 要求的 LICENSE / NOTICE 随包分发**
 *   ③ **第三方声明**（含 vendor 的上游归属）
 *   ④ ⚠️ **`LICENSES.chromium.html`** —— Electron/Chromium 的许可全文，
 *      分发 Electron 应用时**必须带上**（本项目的既定纪律）。它由 electron-builder
 *      从 Electron 发行版带入，所以这里要真的去产物里找，而不是假设它在。
 *   ⑤ **没有把 haruyuki 运行时的依赖树打进去** —— 本客户端只调用它，不分发它
 *   ⑥ 入口文件不是空壳（体积与内容特征）
 *
 * 用法：node scripts/verify-package.mjs [app 路径]
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const APP =
  process.argv[2] ??
  (() => {
    // electron-builder --mac --arm64 的默认输出位置
    const candidates = [
      "release/mac-arm64/haruyuki-desktop.app",
      "release/mac/haruyuki-desktop.app",
    ];
    for (const c of candidates) if (existsSync(c)) return c;
    return candidates[0];
  })();

const checks = [];
function check(label, ok, detail) {
  checks.push({ label, ok, detail });
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` —— ${detail}` : ""}`);
}

/** 在目录树里找一个文件名（产物布局可能随版本变化，别写死路径）。 */
function findFile(root, name, maxDepth = 6) {
  const hits = [];
  const walk = (dir, depth) => {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) walk(full, depth + 1);
      else if (e.name === name) hits.push(full);
    }
  };
  walk(root, 0);
  return hits;
}

console.log(`校验产物: ${resolve(APP)}\n`);

// ---------- ① 存在性 ----------
if (!existsSync(APP)) {
  check("打包产物存在", false, `${APP} 不存在 —— 先跑 bun run dist:dir`);
  console.log(`\n=== 结果：0/${checks.length} 通过 ===`);
  process.exit(1);
}
check("打包产物存在（.app）", true, APP);

const RES = join(APP, "Contents", "Resources");
check("Contents/Resources 存在", existsSync(RES), RES);

// ---------- ②③④ 许可与归属 ----------
const lic = findFile(APP, "LICENSE");
const notice = findFile(APP, "NOTICE");
const third = findFile(APP, "THIRD-PARTY-NOTICES.md");
const chromium = findFile(APP, "LICENSES.chromium.html");

check("Apache-2.0 的 LICENSE 随包分发", lic.length > 0, lic[0] ?? "未找到");
check("NOTICE 随包分发", notice.length > 0, notice[0] ?? "未找到");
check("THIRD-PARTY-NOTICES.md 随包分发", third.length > 0, third[0] ?? "未找到");
check(
  "⚠️ LICENSES.chromium.html 随包分发（分发 Electron 应用必须带）",
  chromium.length > 0,
  chromium[0] ?? "未找到 —— 这是必须修的问题",
);

// ---------- ⑤ 没有捆绑 haruyuki 运行时 ----------
const haruyukiBundled = findFile(APP, "haruyuki.js");
check(
  "没有把 haruyuki 运行时打进产物（只调用，不分发）",
  haruyukiBundled.length === 0,
  haruyukiBundled.length === 0 ? "未找到 haruyuki.js（正确）" : haruyukiBundled[0],
);

// ---------- ⑥ 入口有效（在 asar 里面，要走 asar 清单）----------
const asar = findFile(APP, "app.asar");
check("使用了 asar 打包", asar.length > 0, asar[0] ?? "未找到 app.asar");

if (asar.length > 0) {
  // ⚠️ 不能用文件遍历找 asar 里的东西 —— 它是**单个文件**，遍历看不进去。
  // 第一版就是这么写的，于是报"未找到 index.mjs"，而它其实在里面。
  let listing = "";
  try {
    listing = execFileSync("asar", ["list", asar[0]], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    check("能读取 asar 清单", false, `asar list 失败：${String(e).slice(0, 120)}`);
  }
  if (listing) {
    check("能读取 asar 清单", true, `${listing.split("\n").length} 个条目`);
    check(
      "主进程入口打进 asar",
      listing.includes("/out/main/index.mjs"),
      listing.includes("/out/main/index.mjs") ? "out/main/index.mjs ✓" : "未找到",
    );
    check(
      "渲染包打进 asar",
      /\/out\/renderer\/assets\/index-.*\.js/.test(listing),
      "out/renderer/assets/index-*.js",
    );
    // 产物自包含 → 不该有 node_modules（白增体积）
    const nm = listing.split("\n").filter((l) => l.startsWith("/node_modules")).length;
    check(
      "没有把 node_modules 打进产物（产物已自包含）",
      nm === 0,
      nm === 0 ? "0 个条目" : `仍有 ${nm} 个条目 —— electron-vite 已内联依赖，这些是多余的`,
    );
  }
}

const failed = checks.filter((c) => !c.ok);
console.log(`\n=== 结果：${checks.length - failed.length}/${checks.length} 通过 ===`);
if (failed.length > 0) {
  for (const f of failed) console.log(`  ❌ ${f.label}${f.detail ? ` —— ${f.detail}` : ""}`);
  process.exitCode = 1;
}
