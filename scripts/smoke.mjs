#!/usr/bin/env node
/**
 * End-to-end smoke test: init → start → approve every stage → simulate an
 * upstream change → verify downstream goes stale → re-baseline → Definition of
 * Done → archive. Run with `npm run smoke` after `npm run build`.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = join(PACKAGE_ROOT, "dist", "index.js");
const root = mkdtempSync(join(tmpdir(), "openflow-smoke-"));
const proj = join(root, "proj");

let failures = 0;

function of(args, { cwd = proj, allowFail = false } = {}) {
  try {
    return execFileSync("node", [CLI, ...args], { cwd, encoding: "utf8" });
  } catch (err) {
    if (allowFail) return `${err.stdout ?? ""}${err.stderr ?? ""}`;
    throw new Error(`openflow ${args.join(" ")} failed:\n${err.stdout ?? ""}${err.stderr ?? ""}`);
  }
}

function check(label, condition) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    console.error(`  FAIL ${label}`);
    failures++;
  }
}

function writeArtifacts(dir, body) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "design.md"), body);
  writeFileSync(join(dir, "tasks.md"), "- [x] 1.1 done\n");
}

try {
  for (const name of ["proj", "web", "api", "ctx", "e2e"]) {
    mkdirSync(join(root, name), { recursive: true });
  }

  console.log("init");
  of(["init", "--name", "smoke", "--flow", "default"]);
  check("openflow.md created", existsSync(join(proj, "openflow.md")));
  check("start-default skill installed", existsSync(join(proj, ".cursor/skills/openflow-start-default/SKILL.md")));
  check("cr-frontend-default skill installed", existsSync(join(proj, ".cursor/skills/openflow-cr-frontend-default/SKILL.md")));
  check("start-v6 skill installed", existsSync(join(proj, ".cursor/skills/openflow-start-v6/SKILL.md")));
  check("workflow-rules copied", existsSync(join(proj, ".openflow/workflow-rules/default/frontend-plan.md")));

  writeFileSync(
    join(proj, "openflow.md"),
    `workflow='default'
name='smoke'
intake='file'
intake-path='tickets/{ticket}.md'
frontend='../web'
backend='../api'
context='../ctx'
test='../e2e'
jira-tasks='jira-tasks'
frontend-implementation='../web/docs'
backend-implementation='../api/docs'
`,
  );
  mkdirSync(join(proj, "tickets"), { recursive: true });
  writeFileSync(join(proj, "tickets", "SMOKE-1.md"), "# SMOKE-1\nDo the thing.\n");
  mkdirSync(join(proj, ".openflow", "rules"), { recursive: true });
  writeFileSync(join(proj, ".openflow", "rules", "frontend.md"), "# FE rules\nUse X.\n");
  writeFileSync(join(root, "api", "AGENTS.md"), "# BE rules\nUse Y.\n");

  console.log("rules");
  const rules = of(["rules"]);
  check("configured frontend pack resolved", rules.includes(".openflow/rules/frontend.md"));
  check("backend pack discovered by convention", /AGENTS\.md\s+\[convention/.test(rules));

  console.log("start");
  const started = of([
    "start", "SMOKE-1", "--title", "Smoke test",
    "--sub", "frontend=SMOKE-2", "--sub", "backend=SMOKE-3",
    "--sub", "context=SMOKE-4", "--sub", "test=SMOKE-5",
  ]);
  check("intake file read locally", started.includes("file (local)"));
  check("context.md written", existsSync(join(proj, "openflow/changes/SMOKE-1/context.md")));

  const manifest = JSON.parse(of(["next", "--json"]));
  check("first stage is analyze", manifest.step.kind === "analyze");
  check("rule packs present in manifest", manifest.step.rule_packs.length > 0);
  check(
    "workflow_rule points at analyze.md",
    typeof manifest.step.workflow_rule === "string" &&
      /workflow-rules[/\\]default[/\\]analyze\.md$/.test(manifest.step.workflow_rule),
  );

  writeArtifacts(join(root, "web/openflow/changes/SMOKE-2"), "v1\n");
  writeArtifacts(join(root, "api/openflow/changes/SMOKE-3"), "v1\n");
  writeArtifacts(join(root, "ctx/openflow/changes/SMOKE-4"), "v1\n");
  writeArtifacts(join(root, "e2e/openflow/changes/SMOKE-5"), "v1\n");

  console.log("approve all stages");
  for (let i = 0; i < 10; i++) of(["approve", "-m", `smoke ${i}`]);
  const done = JSON.parse(of(["check", "--json"]));
  check("Definition of Done passes when everything is approved", done.passed === true);

  console.log("simulate upstream change");
  writeFileSync(join(root, "api/openflow/changes/SMOKE-3/design.md"), "v2 renamed endpoint\n");
  const drift = JSON.parse(of(["drift", "--json"]));
  const staleKeys = drift.stale.map((entry) => entry.key);
  check("changed stage reported as modified", drift.modified.some((e) => e.key === "backend-plan"));
  check("downstream integrate marked stale", staleKeys.includes("integrate"));
  check("downstream sync-context marked stale", staleKeys.includes("sync-context"));

  const blocked = JSON.parse(of(["check", "--json"], { allowFail: true }));
  check("Definition of Done fails while stale", blocked.passed === false);
  const archiveOut = of(["archive", "SMOKE-1"], { allowFail: true });
  check("archive blocked while stale", /Archive blocked/.test(archiveOut));

  console.log("re-baseline");
  for (const key of ["backend-plan", "backend-build", "integrate", "test-automation", "handoff", "sync-context"]) {
    of(["approve", "--step", key, "-m", "re-checked"]);
  }
  const after = JSON.parse(of(["drift", "--json"]));
  check("no drift after re-baseline", after.stale.length === 0 && after.modified.length === 0);

  console.log("adopt external work");
  of(["start", "SMOKE-9", "--title", "External"]);
  of(["approve", "-m", "analyzed"]);
  writeArtifacts(join(proj, "external/SMOKE-9"), "written elsewhere\n");
  const adopted = of(["adopt", "frontend-plan", "--path", "external/SMOKE-9", "--note", "external"]);
  check("stage adopted from external artifacts", adopted.includes("Adopted"));
  check("adopted stage shown in status", of(["status", "SMOKE-9"]).includes("[adopted]"));

  console.log("adopt from openflow.md jira-tasks");
  mkdirSync(join(proj, "jira-tasks"), { recursive: true });
  writeFileSync(
    join(proj, "jira-tasks", "SMOKE-IN-jira-tasks.md"),
    "# SMOKE-IN\nAlready analyzed from Jira.\n",
  );
  const dirsOut = of(["dirs"]);
  check("dirs lists analyze → jira-tasks", /analyze\s+jira-tasks/.test(dirsOut));
  const autoStart = of(["start", "SMOKE-IN", "--title", "Incoming"]);
  check("start auto-adopts jira-tasks", autoStart.includes("jira-tasks/SMOKE-IN-jira-tasks.md"));
  check("incoming adopt copied into context.md", existsSync(join(proj, "openflow/changes/SMOKE-IN/context.md")));
  check("incoming adopt advanced cursor", /Cursor: frontend-plan/.test(autoStart));

  const crOut = of(["cr", "frontend", "SMOKE-IN", "-m", "group trips by date"]);
  check("cr jumps to frontend-plan", /Cursor: frontend-plan/.test(crOut));
  check("cr writes prompt file", existsSync(join(proj, "openflow/changes/SMOKE-IN/cr-frontend.md")));

  console.log("blockers");
  of(["block", "waiting on review", "--ticket", "SMOKE-9"]);
  check("approval refused while blocked", of(["approve", "SMOKE-9"], { allowFail: true }).includes("blocked"));
  of(["block", "--clear", "--ticket", "SMOKE-9"]);

  console.log("archive");
  check("archive succeeds once clean", of(["archive", "SMOKE-1"]).includes("Archived"));
  check("archive folder created", existsSync(join(proj, "openflow/archive/changes/SMOKE-1")));

  console.log("v6 reuses default step rules");
  of(["start", "V6-1", "--title", "v6", "--flow", "v6"]);
  const v6m = JSON.parse(of(["next", "V6-1", "--json"]));
  check(
    "v6 analyze use: default playbook",
    typeof v6m.step.workflow_rule === "string" &&
      /workflow-rules[/\\]default[/\\]analyze\.md$/.test(v6m.step.workflow_rule),
  );
} finally {
  rmSync(root, { recursive: true, force: true });
}

if (failures) {
  console.error(`\n${failures} smoke check(s) failed.`);
  process.exit(1);
}
console.log("\nAll smoke checks passed.");
