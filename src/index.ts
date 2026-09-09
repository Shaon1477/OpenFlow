#!/usr/bin/env node
import { Command } from "commander";
import { runInit } from "./cli/init.js";
import { runStart } from "./cli/start.js";
import { runNext } from "./cli/next.js";
import { runApprove } from "./cli/approve.js";
import { runStatus } from "./cli/status.js";
import { runArchive } from "./cli/archive.js";
import { runRules } from "./cli/rules.js";
import { runDirs } from "./cli/dirs.js";
import { runDrift } from "./cli/drift.js";
import { runCheck } from "./cli/check.js";
import { runAdopt } from "./cli/adopt.js";
import { runBlock } from "./cli/block.js";
import { runCr } from "./cli/cr.js";
import { listFlows } from "./lib/flow-loader.js";
import { parseWorkItemArg } from "./lib/ticket.js";

function guard(action: () => void | boolean): void {
  try {
    const result = action();
    if (result === false) process.exitCode = 1;
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

function parsePairs(values?: string[]): Record<string, string> | undefined {
  if (!values?.length) return undefined;
  const out: Record<string, string> = {};
  for (const value of values) {
    const [role, id] = value.split("=");
    if (!role || !id) throw new Error(`Expected role=id, got "${value}"`);
    out[role] = id.toUpperCase();
  }
  return out;
}

const program = new Command();

program
  .name("openflow")
  .description("Workflow orchestration for AI-assisted delivery: stages, gates, rules, state")
  .version("0.2.0");

program
  .command("init")
  .description("Scaffold openflow.md, skills and rules")
  .option("-f, --force", "Overwrite existing openflow.md")
  .option("--flow <id>", "Default flow id")
  .option("--name <name>", "Project name")
  .action((opts) =>
    guard(() =>
      runInit({ force: opts.force, flow: opts.flow, projectName: opts.name }),
    ),
  );

program
  .command("flows")
  .description("List available flows (project flows win over built-ins)")
  .action(() =>
    guard(() => {
      for (const entry of listFlows(process.cwd())) {
        console.log(`${entry.id}\t${entry.source}`);
      }
    }),
  );

program
  .command("start")
  .description("Start or resume a work item")
  .argument("<ticket>", "Work item id (e.g. PROD-5100)")
  .option("-t, --title <title>", "Title used for the branch slug")
  .option("--flow <id>", "Flow for this work item")
  .option("--sub <role=id...>", "Sub-item per role, e.g. --sub frontend=PROD-5102")
  .action((ticket, opts) =>
    guard(() => {
      const parsed = parseWorkItemArg(ticket);
      runStart({
        ticketId: parsed.ticketId,
        title: opts.title ?? parsed.title,
        flow: opts.flow,
        subTickets: parsePairs(opts.sub),
      });
    }),
  );

program
  .command("next")
  .description("Show the current stage manifest: rules, skills, artifacts, gate")
  .argument("[ticket]", "Work item id (default: active)")
  .option("--json", "Machine-readable output for agents")
  .action((ticket, opts) =>
    guard(() => runNext({ ticketId: ticket, json: opts.json })),
  );

program
  .command("approve")
  .description("Pass the human gate and advance; fingerprints stage artifacts")
  .argument("[ticket]", "Work item id (default: active)")
  .option("--step <key>", "Approve a specific stage (re-baseline a stale one)")
  .option("-m, --message <text>", "Comment recorded in the audit trail")
  .action((ticket, opts) =>
    guard(() =>
      runApprove({ ticketId: ticket, stepKey: opts.step, comment: opts.message }),
    ),
  );

program
  .command("block")
  .description("Record or clear a blocker")
  .argument("[reason]", "Why work is blocked")
  .option("--ticket <id>", "Work item id (default: active)")
  .option("--clear", "Clear open blockers")
  .action((reason, opts) =>
    guard(() => runBlock({ reason, ticketId: opts.ticket, clear: opts.clear })),
  );

program
  .command("status")
  .description("Show stage progress, blockers and stale work")
  .argument("[ticket]", "Work item id (default: all)")
  .action((ticket) => guard(() => runStatus({ ticketId: ticket })));

program
  .command("rules")
  .description("Show the project rule packs resolved per role")
  .option("--role <role>", "Limit to one role")
  .option("--json", "Machine-readable output")
  .action((opts) => guard(() => runRules({ role: opts.role, json: opts.json })));

program
  .command("dirs")
  .description("Show repos and doc folders from openflow.md")
  .option("--json", "Machine-readable output")
  .action((opts) => guard(() => runDirs({ json: opts.json })));

program
  .command("drift")
  .description("Detect artifacts changed after approval and mark downstream stages stale")
  .argument("[ticket]", "Work item id (default: active)")
  .option("--json", "Machine-readable output")
  .action((ticket, opts) =>
    guard(() => runDrift({ ticketId: ticket, json: opts.json })),
  );

program
  .command("check")
  .description("Run the executable Definition of Done")
  .argument("[ticket]", "Work item id (default: active)")
  .option("--json", "Machine-readable output")
  .action((ticket, opts) =>
    guard(() => runCheck({ ticketId: ticket, json: opts.json })),
  );

program
  .command("cr")
  .description("Change request on one role of a flow")
  .argument("<role>", "Role to change (frontend, backend, …)")
  .argument("<ticket>", "Core ticket (e.g. prod-5790)")
  .option("--flow <id>", "Flow id (default: openflow.md workflow)")
  .option("-m, --message <text>", "What to change")
  .action((role, ticket, opts) =>
    guard(() =>
      runCr({
        role,
        ticketArg: ticket,
        flow: opts.flow,
        message: opts.message,
      }),
    ),
  );

program
  .command("adopt")
  .description("Mark a stage complete from artifacts written outside OpenFlow")
  .argument("<step>", "Stage key (see `openflow status`)")
  .option("--ticket <id>", "Work item id (default: active)")
  .option("--path <path...>", "Artifact paths to adopt")
  .option("--note <text>", "Why this stage was adopted")
  .option("--no-advance", "Do not move the cursor forward")
  .action((step, opts) =>
    guard(() =>
      runAdopt({
        stepKey: step,
        ticketId: opts.ticket,
        paths: opts.path,
        note: opts.note,
        advance: opts.advance,
      }),
    ),
  );

program
  .command("archive")
  .description("Close out a work item (Definition of Done must pass)")
  .argument("<ticket>", "Work item id")
  .option("--force", "Archive even if the Definition of Done fails")
  .action((ticket, opts) =>
    guard(() => runArchive({ ticketId: ticket, force: opts.force })),
  );

program.parse();
