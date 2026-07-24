---
name: openflow-status
description: Show OpenFlow workflow progress for the active ticket. Use when the user says /openflow-status or asks where they are in the flow.
allowed-tools: Bash(openflow:*)
license: MIT
compatibility: Requires openflow CLI.
metadata:
  author: openflow
  version: "1.0"
---

Show progress:

```bash
openflow status
```

Summarize: active ticket, flow id, current step, completed vs pending steps, blockers if any.
