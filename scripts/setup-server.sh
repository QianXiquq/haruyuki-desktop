#!/usr/bin/env bash
#
# 建立/更新"上游参考仓"——GUI 开发期真正要连的那个 haruyuki 服务端。
#
# 为什么需要这个脚本：`~/haruyuki-upstream` 是**工作区之外**的一份 checkout，
# 机器迁移、误删、或想换版本时都要能一条命令重建。同时它把这次踩过的坑固化下来：
#
#   1. `bun` 必须在 PATH 上 —— 上游的 `bun run build` 内部会再调 `bun`，
#      否则报 `/bin/sh: bun: command not found`（build 退出码 127）。
#   2. GitHub 连接偶发 `SSL_ERROR_SYSCALL`，所以要重试。
#   3. 仓库里**没有**预构建产物（`haruyuki.js`、`dist/` 都是 gitignore 的），
#      所以必须本地构建 —— 不能省。
#   4. `bun install` 很快（bun.lock 自 0.1.3 起未变 + 全局缓存命中），
#      别被"500MB 依赖树"吓到。
#
# 用法：
#   bash scripts/setup-server.sh                # 默认 tag v0.2.0
#   bash scripts/setup-server.sh v0.3.0         # 指定 tag
#   REF_DIR=~/somewhere bash scripts/setup-server.sh
set -euo pipefail

TAG="${1:-v0.2.0}"
REF_DIR="${REF_DIR:-$HOME/haruyuki-upstream}"
REPO_URL="${REPO_URL:-https://github.com/TZYLT/haruyuki.git}"

echo "=== haruyuki 参考仓: $REF_DIR @ $TAG ==="

export PATH="$HOME/.bun/bin:$PATH"
command -v bun >/dev/null 2>&1 || { echo "❌ 找不到 bun（期望 ~/.bun/bin/bun）"; exit 1; }
echo "bun $(bun --version) / node $(node --version)"

# --- clone（带重试：GitHub 偶发 SSL_ERROR_SYSCALL）---
if [ -d "$REF_DIR/.git" ]; then
  echo "--- 已存在，fetch tags ---"
  cd "$REF_DIR" && git fetch --tags --quiet
else
  ok=no
  for i in 1 2 3; do
    echo "--- clone 尝试 $i ---"
    rm -rf "$REF_DIR"
    if git clone --filter=blob:none "$REPO_URL" "$REF_DIR"; then ok=yes; break; fi
    sleep 5
  done
  [ "$ok" = yes ] || { echo "❌ clone 三次都失败（多为网络问题），请重试"; exit 1; }
  cd "$REF_DIR"
fi

git checkout --quiet "$TAG"
echo "--- 版本自证 ---"
echo -n "describe: "; git describe --tags --exact-match 2>/dev/null || echo "(非 tag 点)"
echo -n "version:  "; grep -m1 '"version"' package.json
echo -n "protocol: "; grep -m1 APP_SERVER_PROTOCOL_VERSION src/types/app-server-info.ts

# --- install + build（必须构建：仓库不含预构建产物）---
echo "=== bun install ==="
bun install --frozen-lockfile
echo "=== bun run build ==="
bun run build

# --- 产物核验 + 冒烟测试 ---
echo "=== 产物核验 ==="
for f in haruyuki.js dist/app-server-client.js dist/app-server-client.cjs; do
  printf "%-30s " "$f"
  [ -f "$f" ] && echo "OK" || { echo "MISSING"; exit 1; }
done

echo "=== 冒烟测试：服务端能否报告监听地址 ==="
out="$(mktemp)"
node haruyuki.js server --listen >"$out" 2>&1 &
pid=$!
found=""
for _ in $(seq 1 40); do
  if grep -qE "WebSocket: ws://" "$out" 2>/dev/null; then
    found="$(grep -oE 'ws://[^ ]+' "$out" | head -1)"; break
  fi
  kill -0 "$pid" 2>/dev/null || break
  sleep 0.5
done
kill "$pid" 2>/dev/null || true; wait "$pid" 2>/dev/null || true
if [ -n "$found" ]; then
  echo "✅ 服务端正常: $found"
else
  echo "❌ 服务端未报告监听地址"; cat "$out"; rm -f "$out"; exit 1
fi
rm -f "$out"

echo
echo "✅ 完成。GUI 会自动使用：$REF_DIR/haruyuki.js"
echo "   自测：cd ~/haruyuki-desktop && bun run check:integration"
