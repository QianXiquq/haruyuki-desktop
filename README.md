# haruyuki-desktop

An **unofficial desktop GUI** for [haruyuki](https://github.com/TZYLT/haruyuki),
the local-first terminal runtime for stateful agents.

haruyuki itself is a TUI. This is a separate Electron client that speaks the same
app-server WebSocket protocol, so you get the same agent, the same memory and the
same conversations with a graphical interface — windows, a sidebar, a mouse.

> **Not affiliated with the haruyuki project.** This is an independent client.
> See [NOTICE](NOTICE).

---

## What it gives you

The goal is parity with the TUI for day-to-day use, minus the parts the protocol
does not expose.

| Area | What this client does |
|---|---|
| Conversations | list, open, rename, **delete** (with a typed confirmation), search by title |
| Messages | streaming output, reasoning shown separately, tool calls and results, approval prompts |
| Agents | list, switch, create |
| Models | list and switch, including reasoning-effort tiers |
| Working directory | show and change, per conversation |
| Memory (MemFS) | browse, edit, delete memory files, view commit history |
| Recall | index status, build the index, probe searches, all ten settings, server restart |
| Usage | per-turn tokens, and the running total for the conversation — **including history read from disk** |

Everything is measured rather than assumed: 16 check scripts under `scripts/`
assert the behaviour that matters, including the ones that used to fail silently.

## Requirements

- **macOS** — developed and tested on macOS (Apple Silicon). Nothing is
  macOS-specific in the code beyond packaging, but no other platform has been
  tried.
- **[bun](https://bun.sh)** — used for the build tooling and the check scripts.
- **Node.js 20+** — only if you run the check scripts outside bun.
- **haruyuki 0.2.0 or newer**, installed separately (see below). The app-server
  protocol version is `1` in both 0.1.3 and 0.2.0, so an older runtime will
  connect — but this client is developed and verified against **0.2.0**, and the
  status bar shows the runtime version so you can tell which one you are on.

### Install haruyuki

```bash
npm install -g haruyuki
```

## Point this client at haruyuki

The app needs to know how to launch the haruyuki runtime. It resolves the command
in this order, first match wins:

| Order | Source | Meaning |
|---|---|---|
| 1 | `HARUYUKI_SERVER_CMD` | A full command line. Must include the `server` subcommand. |
| 2 | `HARUYUKI_BIN` | Path to the executable, or to a `.js` entry point. |
| 3 | `HARUYUKI_REPO` | A haruyuki source checkout; its build artifact `<dir>/haruyuki.js` is used. |
| 4 | `~/haruyuki-upstream` | A reference checkout, if that build artifact exists. |
| 5 | `PATH` + common locations | A globally installed `haruyuki`. |
| 6 | — | `<project>/node_modules/.bin/haruyuki` if present. |

A **global `npm install -g haruyuki` is found automatically.** Step 5 searches
`PATH` *and* a set of well-known directories — `/opt/homebrew/bin`,
`/usr/local/bin`, `~/.bun/bin`, `~/.local/bin`, `~/.npm-global/bin`,
`~/.volta/bin` — because an app started from Finder or the Dock usually has a
`PATH` of just `/usr/bin:/bin:/usr/sbin:/sbin` and would otherwise never see a
Homebrew or npm-global install.

If you have several haruyuki installs and want a specific one, set
`HARUYUKI_REPO` or `HARUYUKI_BIN` — the earlier steps win.

From a source checkout of haruyuki, build it once and point at the directory:

```bash
git clone https://github.com/TZYLT/haruyuki.git ~/haruyuki
cd ~/haruyuki && npm install && npm run build
export HARUYUKI_REPO="$HOME/haruyuki"
```

`scripts/setup-server.sh` automates the clone-and-build into
`~/haruyuki-upstream` if you would rather not do it by hand.

## Build and run

```bash
git clone https://github.com/QianXiquq/haruyuki-desktop.git
cd haruyuki-desktop
bun install            # also materializes vendor/ via the postinstall hook
bun run build
```

Then start it with the launcher:

```bash
bash scripts/launch.sh          # rebuilds first if src/ is newer than out/
bash scripts/launch.sh --build  # force a rebuild
```

Or double-click `启动 haruyuki-desktop.command` in Finder.

The launcher handles three things that are easy to get wrong by hand:

- `bun` is often only on `PATH` at `~/.bun/bin`.
- `ELECTRON_RUN_AS_NODE` must be unset. If it is `1`, Electron runs as Node and
  the app dies at startup with `does not provide an export named 'BrowserWindow'`.
- The agent's **working directory** is set explicitly. The server otherwise
  inherits whatever directory you launched from, which means launching from the
  project itself hands the agent this repository — its git history and its
  `node_modules` — as its workspace. The launcher points it at
  `$HARUYUKI_WORKDIR`, defaulting to `~/haruyuki-workspace`.

To run it without the launcher:

```bash
./node_modules/electron/dist/Electron.app/Contents/MacOS/Electron .
```

## Checks

```bash
bun run typecheck

bun run check:integration   # connect, start a runtime, send a message
bun run check:approval      # approval round trip, tool execution, interrupt
bun run check:conversations # history ordering, classification, recall stripping
bun run check:recall        # the recall CLI, its parser, and the flood guards
bun run check:usage         # token accounting, pure functions
bun run check:cwd           # working directory, including the isolation assertions
bun run check:model         # model catalog shape and switching
bun run check:rename        # conversation rename and server-side title search
bun run check:agent         # agent listing and creation
bun run check:memory        # MemFS read/write, frontmatter rules, cleanup
bun run check:search        # title search and the recall probe
bun run check:perf          # streaming load: event count must not track text length
bun run check:delete        # conversation deletion, path escapes, history tokens
bun run check:resolve       # how the haruyuki runtime is located (no server needed)
bun run check:layout        # layout measurements (Electron; see the note below)
```

Some of these create real data — `check:agent` creates and deletes an agent,
`check:memory` writes and removes a memory file, `check:delete` creates and
removes a conversation, `check:recall` changes settings and restores them. They
assert their own cleanup, because leaving debris behind is worse than failing.

> `check:layout` must be launched **through the app's own entry point**
> (`HARUYUKI_APP_ENTRY=out/main/index.mjs`). A bare window that loads the renderer
> has no conversation data, and every assertion would pass vacuously.

## Architecture

```
src/main/       Node side. Owns the WebSocket, the filesystem, and child processes.
  app-server.ts     protocol client; also the pure helpers that shape its data
  server-process.ts launching the runtime, and working-directory resolution
  conversation-store.ts  reading/deleting the local conversation store directly
  recall.ts         the `haruyuki recall` subcommands
  ipc.ts            the whitelisted IPC surface
src/preload/    contextBridge bridge; the renderer gets exactly this, nothing more
src/renderer/   React UI
src/shared/     types and pure helpers shared by both sides
vendor/haruyuki/ generated type declarations (see NOTICE)
```

Two constraints shape the design:

- **The renderer never talks to the server directly.** It has no Node access and
  no socket; everything goes through a whitelisted IPC surface. The server also
  rejects any WebSocket handshake carrying an `Origin` header, so a browser-side
  connection would not work even if it were allowed.
- **Streaming is batched in the main process.** The server emits one delta per
  token; forwarding each one cost ~242 IPC events for a short reply and, combined
  with per-event re-rendering, pinned a CPU core. Deltas are now coalesced into
  one event per ~50 ms. `check:perf` fails if that regresses.

## Known limitations

- **Not signed or notarized.** No prebuilt binaries are published yet; build from
  source. If you package it yourself, macOS Gatekeeper will block the unsigned
  app and you will need to allow it manually.
- **Cost is not displayed.** The server does not send cost over the protocol.
  The on-disk records do carry it, but it is deliberately not shown — only tokens.
- The TUI has features the protocol does not expose, and this client does not try
  to fake them.

## Contributing

This repository is public, so a `pre-commit` hook guards three things that are
painful to undo once pushed:

1. **A non-noreply commit email.** The address is baked into the commit object
   permanently and is scrapable; removing it later needs a full history rewrite.
2. **Machine-specific absolute paths** (`/Users/<name>/…`) leaking into tracked
   files.
3. **Credential-shaped strings** in the staged diff.

Git does not enable repository hooks automatically, so turn it on once per clone:

```bash
git config core.hooksPath .githooks
```

The hook inspects only the lines you are staging, so an already-legitimate file
does not fail because you touched one line of it. It is a last line of defence,
not a security scanner: it does not read history, it cannot tell whether some
prose is private, and `git commit --no-verify` bypasses it.

## License

Apache License 2.0 — see [LICENSE](LICENSE).

Third-party attributions are in [NOTICE](NOTICE) and
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). The haruyuki runtime is not
bundled; install it separately.
