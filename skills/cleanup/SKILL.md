---
name: cleanup
description: Free memory and disk on JC's MacBook without closing anything in use. Run when JC says "cleanup", "clean up my mac", "my mac is slow", or asks to close unused processes or clear caches.
---

# /cleanup

Run the workspace cleanup script and report what it did in plain language.

## Steps

1. Run the script from the workspace root:

```bash
"/Users/skeugene/EUGENE SYSTEM/tools/mac-cleanup.sh"
```

   If JC asks what it *would* do first, run with `--dry-run` instead and show him before running for real.

2. Read the output and tell JC, in this order and in plain words:
   - Before and after: swap used, memory free, load, disk free.
   - What was closed. Only orphaned processes (parent already gone) are ever killed. Name them.
   - What was cleared, with the GB total.
   - What was skipped because it is in use (Chrome cache while Chrome is open, browser downloads while a Playwright or chrome-devtools MCP is running) and the one action that would unlock it.
   - How many Claude windows are open. More than two on an 8 GB machine is the usual cause of slowness, say so.
   - If uptime is past 7 days, recommend a restart. That beats every cache purge.

## Hard rules, never break these
- Never kill a process whose parent is alive. Other Claude sessions, their MCP servers, their builds, Chrome, VS Code: report, do not touch.
- Never delete from Downloads, Desktop, Documents, any project folder, node_modules, .env files, or the Trash. Report sizes only.
- Never run the cleanup while JC is mid-build in another window without saying so first. The script will not kill that build, but a cache purge can slow it.
- Do not extend the script's kill pattern or cache list without JC's explicit go.

## Where things live
- Script: `tools/mac-cleanup.sh` (workspace root). Edit there, not inline.
- Memory note: `feedback_mac_cleanup_command.md` in the memory directory.
