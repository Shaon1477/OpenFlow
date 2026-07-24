# OpenSpec skills (vendored into OpenFlow)

These skills are **copied into OpenFlow** from Fission-AI/OpenSpec. OpenFlow does not depend on a sibling `OpenSpec/` checkout.

| Skill | OpenFlow step(s) |
| --- | --- |
| `openspec-explore` | 1 |
| `openspec-propose` / `new-change` / `ff-change` | 2, 4, 5, 8, 9 |
| `openspec-apply-change` / `continue-change` | 3, 6, 7, 8, 9 |
| `openspec-verify-change` | Before approve on 3, 6, 7, 8 |
| `openspec-update-change` | modify-step recovery |
| `openspec-sync-specs` | 10 |
| `openspec-archive-change` / `bulk-archive-change` | 10 / archive |
| `openspec-onboard` | onboard |

Schema + templates: `../openspec-schema/spec-driven/`.

OpenFlow orchestration skills (flows): `../skills/openflow-*`.
