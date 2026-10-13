import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

/**
 * 距底部多少像素内算"贴底"（超过就认为用户在往上读，不再自动跟随）。
 * 48px 是刻意留的余量：流式时内容持续增长，判定太紧会频繁掉出"贴底"状态、
 * 变成"跟一下就断"。
 */
const NEAR_BOTTOM_PX = 48;

/**
 * 贴底自动滚动。
 *
 * ## 为什么需要它（用户报的"向下滚动不完全"）
 *
 * 这个应用原先**完全没有自动滚动** —— 全仓库没有一处 `scrollIntoView` / `scrollTop`。
 * 所以流式输出时视图停在原处，新内容在下方视野外，感觉就像"滚不到底"。
 * 实测：容器本身能滚到底（`scrollTop == maxScroll`），最后一条也完全可见
 * —— 缺的只是"**有人把它滚进视野**"。
 *
 * ## 行为
 *
 * - **贴底时**：新内容到达 → 跟随滚动
 * - **用户往上翻之后**：不再跟随，**不抢用户的滚动位置**（读历史时最烦被拽回去）
 * - **切换会话**：总是跳到底并恢复跟随（换了内容就该看最新的）
 *
 * ## 为什么用 `useLayoutEffect`
 *
 * 必须在浏览器**绘制之前**完成滚动，否则会先画出旧位置一帧、再跳到底，
 * 流式下表现为明显抖动。
 *
 * @param dep 内容变化的依赖（通常是消息数组）
 * @param resetKey 变化时强制跳到底并恢复跟随（通常是当前会话 id）
 */
export function useAutoScroll<T>(dep: T, resetKey: string | null) {
  const ref = useRef<HTMLElement | null>(null);
  /** 是否跟随到底部。默认 true；只在用户主动往上滚时变 false。 */
  const stick = useRef(true);

  // 用户滚动 → 更新跟随意愿。用 ref 而非 state：这只是滚动意图，不该触发重渲染。
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = (): void => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      stick.current = distance <= NEAR_BOTTOM_PX;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // 切换会话：跳到底 + 恢复跟随。先跑，避免下面那条 effect 看到旧的 stick。
  useLayoutEffect(() => {
    stick.current = true;
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [resetKey]);

  // 新内容到达：贴底才跟随。
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !stick.current) return;
    el.scrollTop = el.scrollHeight;
  }, [dep]);

  /**
   * **内容高度变化时跟随** —— 这是主力机制，上面那条 effect 只是补刀。
   *
   * ⚠️ 为什么要 `ResizeObserver`：实测只依赖 `dep`（React 状态）**跟不上**。
   * 采样到的现象是内容在涨、`scrollTop` 不动：
   *   `{top: 9746, max: 9765, atBottom: false}` —— 差 19px 且持续被拉大。
   * 因为 DOM 高度的变化可以发生在两次状态更新之间，effect 不会因此重跑。
   * 观察**内容元素**的高度才是权威信号。
   *
   * 观察第一个子元素而不是容器本身：容器高度由 flex 布局决定，观察它会在
   * 窗口尺寸变化时误触发。
   */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = el.firstElementChild;
    if (!target || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (stick.current) el.scrollTop = el.scrollHeight;
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  /** 需要时手动滚到底（例如用户点了"回到底部"）。 */
  const scrollToBottom = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    stick.current = true;
    el.scrollTop = el.scrollHeight;
  }, []);

  return { ref, scrollToBottom };
}
