#!/bin/bash
# 启动 haruyuki-desktop（成品）。
#
# 为什么需要这个脚本：之前每次启动都要手敲一长串
#   ./node_modules/electron/dist/Electron.app/Contents/MacOS/Electron .
# 而且 `bun` 不在默认 PATH 里（要 ~/.bun/bin/bun）。这里把两件事都封好。
#
# 用法：
#   bash scripts/launch.sh              正常启动（代码没变就直接起）
#   bash scripts/launch.sh --build      强制先重新构建
#   bash scripts/launch.sh --rebuild    同上（别名）
set -u

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$HERE"

# bun 常在 ~/.bun/bin，而它通常不在非交互 shell 的 PATH 里。
export PATH="$HOME/.bun/bin:$PATH"

# ⚠️ 这个变量必须清掉：如果为 1，Electron 会以 Node 身份运行，
# 于是 `import { BrowserWindow } from "electron"` 报
# "does not provide an export named 'BrowserWindow'" 而直接崩掉。
# 我们的自测脚本会设置它，容易漏在环境里。
unset ELECTRON_RUN_AS_NODE

ELECTRON="./node_modules/electron/dist/Electron.app/Contents/MacOS/Electron"

if [ ! -x "$ELECTRON" ]; then
  echo "✗ 找不到 Electron：$ELECTRON"
  echo "  先装依赖：cd \"$HERE\" && ~/.bun/bin/bun install"
  exit 1
fi

WANT_BUILD=0
for arg in "$@"; do
  case "$arg" in
    --build|--rebuild) WANT_BUILD=1 ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
  esac
done

# 源码比构建产物新 → 自动重建（省得改了代码却跑旧版本）
NEWEST_SRC=$(find src -type f -newer out/main/index.mjs 2>/dev/null | head -1)
if [ "$WANT_BUILD" = "1" ] || { [ ! -f out/main/index.mjs ] && [ "$WANT_BUILD" = "0" ]; } || [ -n "$NEWEST_SRC" ]; then
  if [ "$WANT_BUILD" = "1" ] || [ ! -f out/main/index.mjs ]; then
    echo "▸ 构建中…"
  else
    echo "▸ 检测到源码比构建产物新（$(basename "${NEWEST_SRC:-}")），重新构建…"
  fi
  if ! bun run build; then
    echo "✗ 构建失败，已中止。"
    exit 1
  fi
  echo "▸ 构建完成。"
fi

echo "▸ 启动 haruyuki-desktop…（关掉窗口即退出；本终端会一直占着）"
exec "$ELECTRON" .
