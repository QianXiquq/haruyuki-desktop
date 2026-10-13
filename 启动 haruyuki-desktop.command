#!/bin/bash
# 双击即可启动（Finder 里双击会打开一个终端窗口并运行它）。
# 关掉应用窗口即结束；那个终端窗口也可以直接关掉。
cd "$(dirname "$0")"
exec bash scripts/launch.sh "$@"
