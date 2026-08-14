import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  formatBranchPattern,
  loadConfig,
  slugify,
} from "../lib/config.js";
import {
  firstStep,
  getPackageRoot,
  loadFlowDefinition,
} from "../lib/flow-loader.js";
import { resolveIntake } from "../lib/intake.js";
import {
  appendAudit,
  emptyState,
  initStepMap,
  readState,
  writeState,
  type OpenflowState,
} from "../lib/state.js";

function renderContext(
  cwd: string,
  ticketId: string,
  title: string,
  flowId: string,
  intakeBody?: string,
): string {
  const templatePath = join(getPackageRoot(), "templates", "context.md");
  let body = `# Work Item Context — ${ticketId}\n\n- **Title**: ${title}\n- **Flow**: ${flowId}\n`;
  if (existsSync(templatePath)) {
    body = readFileSync(templatePath, "utf8")
      .replace(/\{\{PARENT_TICKET_ID\}\}|\{\{TICKET_ID\}\}/g, ticketId)
      .replace(/\{\{TICKET_TITLE\}\}/g, title)
      .replace(/\{\{FLOW_ID\}\}/g, flowId);
  }
  if (intakeBody) {
    body += `\n---\n\n## Source work item (verbatim)\n\n${intakeBody.trim()}\n`;
  }
  return body;
}

export interface StartOptions {
  cwd?: string;
  ticketId: string;
  title?: string;
  flow?: string;
  /** role=id pairs, e.g. --sub frontend=PROD-5102 */
  subTickets?: Record<string, string>;
}

export function runStart(options: StartOptions): void {
  const cwd = options.cwd ?? process.cwd();
  const config = loadConfig(cwd);
  const flow = loadFlowDefinition(options.flow ?? config.project.flow, cwd);
  const ticketId = options.ticketId.toUpperCase();
  const now = new Date().toISOString();

  const state = readState(cwd) ?? emptyState(config.ai_tool);
  const existing = state.tickets[ticketId];

  if (existing) {
    state.active_ticket = ticketId;
    if (options.subTickets) {
      existing.sub_tickets = { ...existing.sub_tickets, ...options.subTickets };
    }
    writeState(cwd, state);
    console.log(
      `Resumed ${ticketId} on flow "${existing.flow}" at step "${existing.cursor}".`,
    );
    console.log("Run `openflow next` for the current stage manifest.");
    return;
  }

  const title = options.title ?? ticketId;
  const changeDir = resolve(cwd, "openflow/changes", ticketId);
  mkdirSync(changeDir, { recursive: true });

  const intake = resolveIntake(cwd, config, ticketId);
  const contextRel = `openflow/changes/${ticketId}/context.md`;
  const auditRel = `openflow/changes/${ticketId}/audit.md`;

  if (!existsSync(resolve(cwd, contextRel))) {
    writeFileSync(
      resolve(cwd, contextRel),
      renderContext(cwd, ticketId, title, flow.id, intake.body),
      "utf8",
    );
  }

  const branch = formatBranchPattern(
    config.branching.pattern,
    ticketId,
    slugify(title),
  );
  const branches: Record<string, string> = {};
  for (const role of Object.keys(config.repos)) branches[role] = branch;

  const entry = firstStep(flow);
  const steps = initStepMap(flow.steps.map((step) => step.key));
  steps[entry.key] = { status: "in_progress", started_at: now, artifacts: [] };

  state.active_ticket = ticketId;
  state.tickets[ticketId] = {
    title,
    status: "active",
    flow: flow.id,
    cursor: entry.key,
    started_at: now,
    context_file: contextRel,
    audit_file: auditRel,
    sub_tickets: options.subTickets ?? {},
    intake: {
      provider: intake.provider,
      resolved: intake.mode === "local",
      source: intake.source,
    },
    extensions: { ...config.extensions },
    branches,
    blockers: [],
    steps,
  };

  const ticket = state.tickets[ticketId];
  writeFileSync(
    resolve(cwd, auditRel),
    `# Audit — ${ticketId}\n\n## Session start\n**Timestamp**: ${now}\n**Flow**: ${flow.id}\n**Intake**: ${intake.provider} (${intake.mode})\n`,
    "utf8",
  );
  appendAudit(
    cwd,
    ticket,
    `## Stage started — ${entry.name}\n**Timestamp**: ${now}\n**Step key**: ${entry.key}`,
  );

  writeState(cwd, state as OpenflowState);

  console.log(`Started ${ticketId} on flow "${flow.name}".`);
  console.log(`  Stage:   ${entry.key} — ${entry.name}`);
  console.log(`  Context: ${contextRel}`);
  console.log(`  Audit:   ${auditRel}`);
  console.log(`  Branch:  ${branch}`);
  console.log(`  Intake:  ${intake.provider} (${intake.mode})`);
  if (intake.instructions.length) {
    console.log("\nIntake instructions for the agent:");
    for (const line of intake.instructions) console.log(`  - ${line}`);
  }
  console.log("\nRun `openflow next` for rules, skills and artifact paths.");
}
