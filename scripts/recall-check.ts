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
import { runRecallCommand, toRecallArgs } from "@/main/recall";

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

// ---------- ⑥ B1：设置旋钮「改 → 复核 → 改回」----------
console.log("\n=== ⑥ 设置旋钮往返（每个都改一次再改回原值）===");
const baseline = parseRecallStatus((await runRecallCommand(["status"])).output);
console.log(`   基线：${JSON.stringify(baseline.settings)}`);

/** 改一个旋钮，用 status 复核，然后改回基线值。 */
async function roundTrip(
  label: string,
  args: string[],
  /** 从 settings 里读出该旋钮当前值的函数，用于还原。 */
  restoreArgs: string[],
  verify: (after: ReturnType<typeof parseRecallStatus>) => boolean,
  expectAfter: string,
): Promise<void> {
  const applied = await runRecallCommand(args);
  if (!applied.ok) {
    check(`${label} 能写入`, false, applied.error ?? "");
    return;
  }
  const after = parseRecallStatus((await runRecallCommand(["status"])).output);
  check(`${label} 写入了正确值`, verify(after), `期望 ${expectAfter}，实际 ${JSON.stringify(after.settings)}`);
  const restored = await runRecallCommand(restoreArgs);
  check(`${label} 能还原`, restored.ok, restored.error ?? "");
}

const s0 = baseline.settings;
await roundTrip("limit", ["limit", "7"], ["limit", String(s0.limit ?? 3)], (a) => a.settings.limit === 7, "limit=7");
await roundTrip("timeout", ["timeout", "2222"], ["timeout", String(s0.timeoutMs ?? 1000)], (a) => a.settings.timeoutMs === 2222, "timeout=2222");
await roundTrip("dedup", ["dedup", "4"], ["dedup", String(s0.dedup ?? 10)], (a) => a.settings.dedup === 4, "dedup=4");
await roundTrip("chars", ["chars", "333", "999"], ["chars", String(s0.excerptCharacters ?? 400), String(s0.totalCharacters ?? 1200)], (a) => a.settings.excerptCharacters === 333 && a.settings.totalCharacters === 999, "chars=333/999");
await roundTrip("ratio", ["ratio", "0.5"], ["ratio", String(s0.ratio ?? 0.35)], (a) => a.settings.ratio === 0.5, "ratio=0.5");
await roundTrip("diversity", ["diversity", "split"], ["diversity", String(s0.diversity ?? "none")], (a) => a.settings.diversity === "split", "diversity=split");
await roundTrip("display", ["display", "full"], ["display", String(s0.display ?? "summary")], (a) => a.settings.display === "full", "display=full");

// 还原复核：必须回到基线
const restored = parseRecallStatus((await runRecallCommand(["status"])).output);
check(
  "全部旋钮已还原到基线",
  JSON.stringify(restored.settings) === JSON.stringify(s0),
  `基线 ${JSON.stringify(s0)} → 现在 ${JSON.stringify(restored.settings)}`,
);

// ---------- ⑦ B1：越界值必须被**我们**在 spawn 之前拒绝 ----------
console.log("\n=== ⑦ 越界值：本地拒绝，且不写进 settings.json ===");
const beforeInvalid = parseRecallStatus((await runRecallCommand(["status"])).output).settings;

/** `toRecallArgs` 是主进程用的校验层；这里直接断言它会抛。 */
function rejects(label: string, setting: Parameters<typeof toRecallArgs>[0]): void {
  let threw: unknown = null;
  try {
    toRecallArgs(setting);
  } catch (error) {
    threw = error;
  }
  check(label, threw !== null, threw instanceof Error ? threw.message.slice(0, 70) : "没有抛错（应该拒绝！）");
}

rejects("ratio > 1 被拒绝（上游语义：不是裁剪）", { knob: "ratio", value: 1.5 });
rejects("ratio < 0 被拒绝", { knob: "ratio", value: -0.1 });
rejects("负数计数被拒绝", { knob: "limit", value: -1 });
rejects("小数计数被拒绝", { knob: "timeout", value: 1.5 });
rejects("非整数被拒绝", { knob: "dedup", value: Number.NaN });
rejects("超大计数被拒绝", { knob: "limit", value: 999_999_999 });
rejects("非法 diversity 被拒绝", { knob: "diversity", value: "banana" as never });
rejects("非法 display 被拒绝", { knob: "display", value: "loud" as never });
rejects("enabled 非布尔被拒绝", { knob: "enabled", value: "yes" as never });
rejects("chars 缺一个数字被拒绝", { knob: "chars", value: { perEntry: 3, total: undefined as never } });

// 合法值必须能通过（否则上面的"拒绝"可能只是把什么都拒了）
let acceptedAll = true;
try {
  toRecallArgs({ knob: "limit", value: 0 });
  toRecallArgs({ knob: "ratio", value: 0 });
  toRecallArgs({ knob: "ratio", value: 1 });
  toRecallArgs({ knob: "timeout", value: 0 });
  toRecallArgs({ knob: "chars", value: { perEntry: 0, total: 0 } });
  toRecallArgs({ knob: "enabled", value: true });
  toRecallArgs({ knob: "diversity", value: "none" });
} catch {
  acceptedAll = false;
}
check("合法值（含边界 0 与 1）全部通过校验", acceptedAll);

const afterInvalid = parseRecallStatus((await runRecallCommand(["status"])).output).settings;
check(
  "被拒绝的输入没有触碰 settings.json",
  JSON.stringify(afterInvalid) === JSON.stringify(beforeInvalid),
  `${JSON.stringify(beforeInvalid)} → ${JSON.stringify(afterInvalid)}`,
);

// ---------- 汇总 ----------
const failed = checks.filter((c) => !c.ok);
console.log(`\n=== 结果：${checks.length - failed.length}/${checks.length} 通过 ===`);
if (failed.length > 0) {
  console.log("未通过：");
  for (const item of failed) console.log(`  ❌ ${item.label}${item.detail ? ` —— ${item.detail}` : ""}`);
  process.exitCode = 1;
}
