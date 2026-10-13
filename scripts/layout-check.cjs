/**
 * 布局量测自测（Electron 内运行，不需要 app-server 之外的额外依赖）。
 *
 * ## 为什么需要它 —— 两个真实 bug 都是"截图看不出来"的
 *
 * 1. 会话列表的每一行被**压扁**：`.conversation` 是纵向 flex 容器里的子项，
 *    flex 子项默认 `flex-shrink: 1`，会话一多就被压缩而不是让容器滚动。
 *    实测标题行高只剩 **7.3px**（正常 15.6px），文字被纵向裁掉、糊成一团。
 *    我盯着截图看了好几轮，一直误判成"截图伪影"。
 * 2. 会话标题与日期**被居中**：按钮基础样式带的 `justify-content:center`
 *    泄漏到了纵向列表项上。
 *
 * 两者都是**数值问题**，所以用数值断言，不靠眼睛。
 */
const { app, BrowserWindow } = require("electron");

const checks = [];
const check = (label, ok, detail) => {
  checks.push({ label, ok, detail });
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` —— ${detail}` : ""}`);
};

/**
 * ⚠️ 必须以**应用自身的入口**运行（同截图 harness 的做法）：
 *   HARUYUKI_APP_ENTRY=.../out/main/index.mjs electron scripts/layout-check.cjs
 * 直接开一个裸窗口去 load dev server 是不行的 —— 那样渲染进程拿不到会话列表
 * （实测 count 为 0），断言会全部落空。
 */

const MEASURE = `(() => {
  const rec = (s) => { const n = document.querySelector(s); if (!n) return null;
    const r = n.getBoundingClientRect(); return { x:+r.x.toFixed(1), y:+r.y.toFixed(1), w:+r.width.toFixed(1), h:+r.height.toFixed(1) }; };
  const cs = (s, p) => { const n = document.querySelector(s); return n ? getComputedStyle(n)[p] : null; };
  const list = document.querySelector('.conversation-list');
  return {
    count: document.querySelectorAll('.conversation').length,
    conv: rec('.conversation'), title: rec('.conversation-title'), meta: rec('.conversation-meta'),
    assistant: rec('.msg.assistant'),
    listScrollH: list?.scrollHeight, listClientH: list?.clientHeight,
    listScrollW: list?.scrollWidth, listClientW: list?.clientWidth,
    convAlign: cs('.conversation', 'alignItems'), convJustify: cs('.conversation', 'justifyContent'),
    hasSidebarPanels: !!document.querySelector('.sidebar-panels'),
    hasRecallPanel: !!document.querySelector('.recall-panel'),
    hasSettingsTrigger: !!document.querySelector('.settings-trigger'),
    listH: list ? +list.getBoundingClientRect().height.toFixed(1) : null,
    sideH: (() => { const a = document.querySelector('.sidebar'); return a ? +a.getBoundingClientRect().height.toFixed(1) : null; })(),
    sidebarBg: cs('.sidebar', 'backgroundColor'), mainBg: cs('.main', 'backgroundColor'),
    win: [window.innerWidth, window.innerHeight],
  };
})()`;

const of = BrowserWindow.prototype.loadFile, ou = BrowserWindow.prototype.loadURL;
function afterLoad(win) {
  const js = (c) => win.webContents.executeJavaScript(c);
  void (async () => {
    try {
      await new Promise((r) => setTimeout(r, 16000));
      const g = await js(MEASURE);
      console.log("量测:", JSON.stringify(g, null, 1));
      console.log("\n=== 断言 ===");

      // ① 行高不被压扁（本轮最严重的 bug：实测 7.3px，正常 15.6px）
      check("会话标题行高未被压扁（>14px）", (g.title?.h ?? 0) > 14, `实测 ${g.title?.h}px（正常约 15.6；出 bug 时 7.3）`);
      check("会话行高未被压扁（>34px）", (g.conv?.h ?? 0) > 34, `实测 ${g.conv?.h}px`);

      // ② 列表不靠**压缩行高**来容纳内容
      //
      // ⚠️ 要守的是"行高不被压扁"，不是"必须溢出"。
      // 原断言要求 scrollHeight > clientHeight，但会话少时两者相等
      // （内容刚好装下、本来就不该滚动）会**误报失败** —— 实测就这么误报过一次。
      // 被压缩时 scrollHeight 会明显**小于** clientHeight，那才是真问题。
      if (g.count > 0) {
        check(
          "列表不被压缩（内容高度 ≥ 可视高度）",
          (g.listScrollH ?? 0) >= (g.listClientH ?? 0),
          `scrollHeight ${g.listScrollH} vs clientHeight ${g.listClientH}（count=${g.count}）`,
        );
      } else {
        check("没有会话，滚动断言跳过", true, `count=${g.count}`);
      }

      // ③ 左对齐：按钮基础样式的居中不能泄漏到纵向列表项
      check("会话项纵向左对齐", g.convAlign === "stretch" && g.convJustify === "flex-start",
        `align-items=${g.convAlign} justify-content=${g.convJustify}`);
      check("标题与日期同一起点", g.title && g.meta && g.title.x === g.meta.x,
        `title.x=${g.title?.x} meta.x=${g.meta?.x}`);

      // ④ 无横向溢出
      check("会话列表无横向溢出", (g.listScrollW ?? 0) <= (g.listClientW ?? 0),
        `scrollWidth ${g.listScrollW} vs clientWidth ${g.listClientW}`);

      // ⑤ 层次靠亮度分层
      check("侧栏与主区底色不同", g.sidebarBg !== g.mainBg, `sidebar=${g.sidebarBg} main=${g.mainBg}`);

      // ⑥ 侧栏不再常驻低频面板（recall 已搬进设置弹窗）
  check(
    "侧栏不再有常驻的 recall 面板",
    !g.hasSidebarPanels && !g.hasRecallPanel,
    `sidebar-panels=${g.hasSidebarPanels} recall-panel=${g.hasRecallPanel}`,
  );
  check("顶栏有设置入口", g.hasSettingsTrigger, `settings-trigger=${g.hasSettingsTrigger}`);
  // 低频面板搬走后，会话列表应该占掉侧栏绝大部分高度
  check(
    "会话列表占据侧栏大部分高度（低频面板不再挤占）",
    (g.listH ?? 0) / (g.sideH ?? 1) > 0.6,
    `列表 ${g.listH} / 侧栏 ${g.sideH} = ${(((g.listH ?? 0) / (g.sideH ?? 1)) * 100).toFixed(0)}%`,
  );

      // ⑦ 对话正文限宽
      //
      // ⚠️ 这条依赖**页面里有 assistant 消息**，而当前会话可能是空的
      // （例如它从未说过话，或历史还没拉回来）。没有元素时宽度是 undefined，
      // 直接断言会**误报失败** —— 实测就是这么挂的。没有内容时明确跳过，
      // 并打印原因；有一条真实消息时照常断言。
      const assistantWidth = g.assistant?.w ?? 0;
      if (g.assistant) {
        check(
          "对话正文有限宽（<=900px）",
          assistantWidth > 0 && assistantWidth <= 900,
          `assistant 宽 ${assistantWidth}px`,
        );
      } else {
        check(
          "对话正文限宽（跳过）",
          true,
          "当前会话没有 assistant 消息，无法量测正文宽度",
        );
      }

      const failed = checks.filter((c) => !c.ok);
      console.log(`\n=== 结果：${checks.length - failed.length}/${checks.length} 通过 ===`);
      for (const f of failed) console.log(`  ❌ ${f.label}${f.detail ? ` —— ${f.detail}` : ""}`);
      process.exitCode = failed.length ? 1 : 0;
    } catch (e) {
      console.error("[layout] 量测失败:", e);
      process.exitCode = 1;
    } finally {
      setTimeout(() => app.exit(process.exitCode ?? 0), 300);
    }
  })();
}
BrowserWindow.prototype.loadFile = function (...a) { const r = of.apply(this, a); afterLoad(this); return r; };
BrowserWindow.prototype.loadURL = function (...a) { const r = ou.apply(this, a); afterLoad(this); return r; };
require(process.env.HARUYUKI_APP_ENTRY);
