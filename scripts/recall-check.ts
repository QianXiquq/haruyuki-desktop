/**
 * recall 子命令链路自测（B0）。
 *
 * 这一份**不需要 app-server**：`haruyuki recall …` 是独立的 CLI 子命令，直接跑它就行。
 * 所以这个 check 比另外三个快得多。
 *
 * 断言的都是"会静默出错、且 GUI 无法自救"的点：
 *   ① `recall status` 能跑通，且能被 `parseRecallStatus` 解析出覆盖率
 *   ② 没有索引时，解析结果里 `missing > 0`（这是 recall 静默失效的判定条件）
 *   ③ `parseRecallStatus` 对空输入/异常措辞**不抛异常**，且 `raw` 仍在
 *   ④ `build` 幂等：连跑两次都成功（按钮会被重复点）
 *   ⑤ ⚠️ **失败必须被看见**：非零退出码时 `ok === false` 且 `error` 有内容，
 *      绝不允许"静默返回空字符串"——那正是 recall 失效却无人察觉的成因
 *
 * 注意：`build` 会真实写入召回索引（位于 ~/.haruyuki/lc-local-backend 下）。
 */
import { parseRecallStatus } from "@/shared/ipc-contract";
import { runRecallCommand } from "@/main/recall";

const checks: { label: string; ok: boolean; detail?: string }[] = [];
function check(label: string, ok: boolean, detail?: string): void {
  checks.push({ label, ok, ...(detail ? { detail } : {}) });
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` —— ${detail}` : ""}`);
}

// ---------- ① status 能跑通 ----------
console.log("=== ① haruyuki recall status ===");
const status = await runRecallCommand(["status"]);
check("status 退出码为 0", status.ok, status.error ?? "");
check("status 有输出", status.output.length > 0);
console.log("   --- 输出 ---");
for (const line of status.output.split("\n")) console.log(`   ${line}`);

const parsed = parseRecallStatus(status.output);
check("解析出了 enabled 标志", typeof parsed.enabled === "boolean", `enabled=${parsed.enabled}`);
check("解析出了索引覆盖行", parsed.indexLine.length > 0, parsed.indexLine);

// ---------- ② 覆盖率的判定条件 ----------
console.log("\n=== ② 覆盖率与 missing ===");
check(
  "missing 是非负数（0 = 全覆盖）",
  Number.isInteger(parsed.missing) && parsed.missing >= 0,
  `missing=${parsed.missing}`,
);

// ---------- ③ 解析器对异常输入必须宽容 ----------
console.log("\n=== ③ parseRecallStatus 的健壮性 ===");
const empty = parseRecallStatus("");
check("空输入不抛异常", true, `indexLine=${JSON.stringify(empty.indexLine)} missing=${empty.missing}`);
check("空输入时 raw 仍是字符串", typeof empty.raw === "string");
const weird = parseRecallStatus("Some: totally different wording\nIndex: nonsense");
check(
  "上游换措辞时不抛异常、missing 退化为 0",
  weird.missing === 0 && typeof weird.enabled === "boolean",
  `missing=${weird.missing}`,
);

// 用**合成输出**覆盖"静默失效"这条判定，不去破坏真实的索引。
// 这是 B0 告警逻辑的核心条件：missing > 0 ⇒ 这些会话永远召不回来且不报错。
const neverIndexed = parseRecallStatus(
  [
    "Recall: on",
    "Breaker: healthy (0 consecutive failures)",
    "Index: 0/22 conversations indexed · 0 records · 22 without an index",
    "  22 conversations cannot be recalled yet. Run /recall build.",
  ].join("\n"),
);
check(
  "合成「从未建索引」输出 ⇒ missing=22（告警条件成立）",
  neverIndexed.missing === 22,
  `missing=${neverIndexed.missing}`,
);
check(
  "合成「已关闭」输出 ⇒ enabled=false",
  parseRecallStatus("Recall: off\nIndex: 22/22 conversations indexed · 59 records").enabled === false,
);
check(
  "「on」不会被「off」的子串误判",
  parseRecallStatus("Recall: on\nIndex: 1/1").enabled === true,
);

// ---------- ④ build 幂等 ----------
console.log("\n=== ④ haruyuki recall build（连跑两次，验证幂等）===");
const firstBuild = await runRecallCommand(["build"]);
check("第 1 次 build 成功", firstBuild.ok, firstBuild.error ?? firstBuild.output.split("\n")[0] ?? "");
console.log(`   ${firstBuild.output.split("\n")[0] ?? ""}`);

const secondBuild = await runRecallCommand(["build"]);
check("第 2 次 build 仍成功（幂等，按钮可重复点）", secondBuild.ok, secondBuild.error ?? "");
console.log(`   ${secondBuild.output.split("\n")[0] ?? ""}`);

// 构建后覆盖率必须变好（或至少不报缺索引）
const after = await runRecallCommand(["status"]);
const afterParsed = parseRecallStatus(after.output);
check(
  "build 之后没有会话缺索引",
  after.ok && afterParsed.missing === 0,
  `missing=${afterParsed.missing} · ${afterParsed.indexLine}`,
);

// ---------- ⑤ 失败必须可见（这一条是重点）----------
console.log("\n=== ⑤ 失败可见性（不许静默返回空）===");
// `recall now` 缺查询文本 → 上游会非零退出并给用法说明。
// 用它来验证"失败被如实报告"，而不是被吞掉。
const bogus = await runRecallCommand(["now"]);
check("非法调用返回 ok === false", bogus.ok === false, `ok=${bogus.ok}`);
check("非法调用带上了 error 说明", Boolean(bogus.error), bogus.error ?? "");
check("非法调用的原文输出没有丢失", bogus.output.length > 0, `${bogus.output.length} 字符`);
check("非法调用没有把设置改坏（复核仍是同一状态）", (await runRecallCommand(["status"])).ok);

// ---------- 汇总 ----------
const failed = checks.filter((c) => !c.ok);
console.log(`\n=== 结果：${checks.length - failed.length}/${checks.length} 通过 ===`);
if (failed.length > 0) {
  console.log("未通过：");
  for (const item of failed) console.log(`  ❌ ${item.label}${item.detail ? ` —— ${item.detail}` : ""}`);
  process.exitCode = 1;
}
