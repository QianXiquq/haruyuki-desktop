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

      // ② 列表靠滚动而不是压缩来容纳
      if (g.count > 8) {
        check("会话多时列表滚动而非压缩行高", (g.listScrollH ?? 0) > (g.listClientH ?? 0),
          `scrollHeight ${g.listScrollH} > clientHeight ${g.listClientH}`);
      } else {
        check("会话数不足以触发滚动断言（跳过）", true, `count=${g.count}`);
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

      // ⑥ 对话正文限宽
      check("对话正文有限宽（<=900px）", (g.assistant?.w ?? 0) <= 900 && (g.assistant?.w ?? 0) > 0,
        `assistant 宽 ${g.assistant?.w}px`);

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
