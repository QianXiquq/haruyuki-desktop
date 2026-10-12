/**
 * 用量统计自测（C 项）。
 *
 * 这一份**不需要 app-server**：核心是 `shared/ipc-contract.ts` 里的纯函数。
 * 之所以要单独测，是因为这些函数全是**边界**问题，而边界错了界面上会显示
 * 荒唐数字（2896% 的缓存命中率、NaN、把上下文规模当成本轮用量…）。
 *
 * 重点断言：
 *   ① `parseUsage` 不会把 `total_tokens`（上下文规模）当成本轮用量 —— 这是实测踩过的语义坑
 *   ② `cacheHitRate` 的三种退化情形都返回 `undefined`（界面显示 `—`），而不是 0 / 100 / 负 / 超 100
 *   ③ `accumulateUsage` 对上下文规模是**覆盖**而不是累加
 *   ④ 缺字段 / 脏数据不产生 `NaN`
 */
import {
  accumulateUsage,
  cacheHitRate,
  EMPTY_USAGE_TOTALS,
  formatTokens,
  formatUsageLine,
  type UsageStats,
} from "@/shared/ipc-contract";
import { parseUsage } from "@/main/app-server";

const checks: { label: string; ok: boolean; detail?: string }[] = [];
function check(label: string, ok: boolean, detail?: string): void {
  checks.push({ label, ok, ...(detail ? { detail } : {}) });
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` —— ${detail}` : ""}`);
}

const sample: UsageStats = {
  promptTokens: 933,
  completionTokens: 84,
  cachedInputTokens: 27008,
  reasoningTokens: 78,
  contextTokens: 28025,
};

// ---------- ① parseUsage 的语义 ----------
console.log("=== ① parseUsage：total_tokens 不是本轮用量 ===");
const parsed = parseUsage({
  prompt_tokens: 933,
  completion_tokens: 84,
  total_tokens: 28025,
  cached_input_tokens: 27008,
  reasoning_tokens: 78,
  context_tokens: 28025,
});
check("prompt/completion 取的是本轮字段", parsed.promptTokens === 933 && parsed.completionTokens === 84);
check(
  "contextTokens 取 context_tokens，而不是把 total_tokens 当本轮用量",
  parsed.contextTokens === 28025,
  `contextTokens=${parsed.contextTokens}`,
);
check(
  "本轮用量绝不可能等于 total_tokens（防语义搞反）",
  parsed.promptTokens !== 28025 && parsed.completionTokens !== 28025,
);

const onlyTotal = parseUsage({ total_tokens: 1234 });
check(
  "只有 total_tokens 时，本轮 prompt/completion 保持 0（不当成用量）",
  onlyTotal.promptTokens === 0 && onlyTotal.completionTokens === 0 && onlyTotal.contextTokens === 1234,
);

console.log("\n=== 脏数据不产生 NaN ===");
const dirty = parseUsage({ prompt_tokens: "abc", completion_tokens: null, cached_input_tokens: -5, reasoning_tokens: undefined });
check(
  "字符串/null/负数/缺失一律收敛成 0",
  dirty.promptTokens === 0 && dirty.completionTokens === 0 && dirty.cachedInputTokens === 0 && dirty.reasoningTokens === 0,
  JSON.stringify(dirty),
);
check("脏数据下没有 NaN", !Object.values(dirty).some((v) => Number.isNaN(v)));

// ---------- ② cacheHitRate 的退化情形 ----------
console.log("\n=== ② cacheHitRate：三种退化必须返回 undefined ===");
check("prompt=0 → undefined（不除零）", cacheHitRate({ ...sample, promptTokens: 0 }) === undefined);
check("cached=0 → undefined（不是 0% 命中）", cacheHitRate({ ...sample, cachedInputTokens: 0 }) === undefined);
const clamped = cacheHitRate(sample);
check(
  "cached(27008) > prompt(933) 时夹到 100，不出现 2896%",
  clamped === 100,
  `得到 ${clamped}`,
);
check("cached < prompt 时按比例算", Math.round(cacheHitRate({ ...sample, promptTokens: 2000, cachedInputTokens: 1500 }) ?? -1) === 75);
check("比率永远落在 [0,100]", [0, 1, 999, 1e9].every((c) => {
  const r = cacheHitRate({ ...sample, cachedInputTokens: c });
  return r === undefined || (r >= 0 && r <= 100);
}));

// ---------- ③ accumulateUsage ----------
console.log("\n=== ③ accumulateUsage：上下文是覆盖不是累加 ===");
const one = accumulateUsage(EMPTY_USAGE_TOTALS, sample);
check("轮数 +1", one.turns === 1);
check("token 累加", one.promptTokens === 933 && one.completionTokens === 84);
check("contextTokens 是覆盖", one.contextTokens === 28025);

const two = accumulateUsage(one, { ...sample, promptTokens: 100, completionTokens: 10, contextTokens: 999 });
check("第二轮后 token 相加", two.promptTokens === 1033 && two.completionTokens === 94, JSON.stringify(two));
check("第二轮后 contextTokens 被覆盖成 999（不是相加）", two.contextTokens === 999, `contextTokens=${two.contextTokens}`);
check("轮数 = 2", two.turns === 2);
check("reasoning 也累加", two.reasoningTokens === 156);

// ---------- ④ 格式化 ----------
console.log("\n=== ④ 格式化 ===");
check("小于 1000 原样", formatTokens(999) === "999");
check("1000 以上用 k", formatTokens(1234) === "1.2k", formatTokens(1234));
check("非法输入显示 —而不是 NaN", formatTokens(Number.NaN) === "—" && formatTokens(-1) === "—");
const line = formatUsageLine(sample);
check("极简行包含上下行与缓存命中", /↑933/.test(line) && /↓84/.test(line) && /缓存 100%/.test(line), line);
check(
  "没有缓存命中时极简行不显示缓存段",
  !/缓存/.test(formatUsageLine({ ...sample, cachedInputTokens: 0 })),
  formatUsageLine({ ...sample, cachedInputTokens: 0 }),
);

// ---------- 汇总 ----------
const failed = checks.filter((c) => !c.ok);
console.log(`\n=== 结果：${checks.length - failed.length}/${checks.length} 通过 ===`);
if (failed.length > 0) {
  console.log("未通过：");
  for (const item of failed) console.log(`  ❌ ${item.label}${item.detail ? ` —— ${item.detail}` : ""}`);
  process.exitCode = 1;
}
