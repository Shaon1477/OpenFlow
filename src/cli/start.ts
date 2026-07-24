import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig, formatBranchPattern } from "../lib/config.js";
import { loadFlowDefinition } from "../lib/flow-loader.js";
import {
  readState,
  writeState,
  initStepMap,
  type OpenflowState,
} from "../lib/state.js";

const PACKAGE_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function normalizeSubTickets(raw: {
  frontend?: string;
  backend?: string;
  context?: string;
  test?: string;
  mobile?: string;
}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v) out[k] = v.toUpperCase();
  }
  return out;
}

export interface StartOptions {
  cwd?: string;
  ticketId: string;
  title?: string;
  flow?: string;
  subTickets?: {
    frontend?: string;
    backend?: string;
    context?: string;
    test?: string;
    mobile?: string;
  };
}

export function runStart(options: StartOptions): void {
  const cwd = options.cwd ?? process.cwd();
  const config = loadConfig(cwd);
  const flowId = options.flow ?? config.project.flow;
  const flow = loadFlowDefinition(flowId, cwd);
  const ticketId = options.ticketId.toUpperCase();
  const title = options.title ?? ticketId;
  const now = new Date().toISOString();

  const existing = readState(cwd);
  if (existing?.active_ticket && existing.active_ticket !== ticketId) {
    throw new Error(
      `Active ticket ${existing.active_ticket} in progress. Archive or complete it before starting ${ticketId}.`,
    );
  }

  // Resume if this ticket already has a change folder + state
  if (existing?.tickets[ticketId] && existsSync(resolve(cwd, "openflow/changes", ticketId))) {
    existing.active_ticket = ticketId;
    existing.flow = existing.tickets[ticketId].flow ?? existing.flow;
    existing.current_step = existing.tickets[ticketId].current_step ?? existing.current_step;
    if (options.subTickets) {
      existing.tickets[ticketId].sub_tickets = {
        ...existing.tickets[ticketId].sub_tickets,
        ...normalizeSubTickets(options.subTickets),
      };
    }
    writeState(cwd, existing);
    console.log(
      `Resumed ${ticketId} at step ${existing.current_step} (${existing.flow}).`,
    );
    return;
  }

  const changeDir = resolve(cwd, "openflow/changes", ticketId);
  if (existsSync(changeDir) && !existing?.tickets[ticketId]) {
    throw new Error(
      `Change directory already exists without state: openflow/changes/${ticketId}`,
    );
  }
  mkdirSync(changeDir, { recursive: true });

  const contextRel = `openflow/changes/${ticketId}/context.md`;
  const auditRel = `openflow/changes/${ticketId}/audit.md`;
  const contextPath = resolve(cwd, contextRel);
  const auditPath = resolve(cwd, auditRel);

  const templatePath = join(PACKAGE_ROOT, "templates", "context.md");
  let contextBody = `# Ticket Context — ${ticketId}\n\n`;
  if (existsSync(templatePath)) {
    contextBody = readFileSync(templatePath, "utf8")
      .replace(/\{\{PARENT_TICKET_ID\}\}/g, ticketId)
      .replace(/\{\{TICKET_TITLE\}\}/g, title)
      .replace(/\{\{FLOW_ID\}\}/g, flow.id);
  }
  writeFileSync(contextPath, contextBody, "utf8");

  const auditBody = `## Session Start\n**Timestamp**: ${now}\n**Flow**: ${flow.id}\n**Ticket**: ${ticketId}\n`;
  writeFileSync(auditPath, auditBody, "utf8");

  const slug = slugify(title);
  const branchName = formatBranchPattern(
    config.branching.pattern,
    ticketId,
    slug,
  );
  const branches: Record<string, string> = {};
  for (const repoKey of Object.keys(config.repos)) {
    branches[repoKey] = branchName;
  }

  const steps = initStepMap(flow.steps.length);
  steps["1"] = { status: "in_progress", started_at: now };

  const ticketState = {
    title,
    status: "active" as const,
    flow: flow.id,
    current_step: 1,
    started_at: now,
    context_file: contextRel,
    audit_file: auditRel,
    extensions: {
      security: config.extensions?.security ?? false,
      testing: config.extensions?.testing ?? false,
      resiliency: config.extensions?.resiliency ?? false,
    },
    blockers: [],
    branches,
    steps,
  };

  const state: OpenflowState = existing ?? {
    active_ticket: ticketId,
    flow: flow.id,
    current_step: 1,
    started_at: now,
    ai_tool: config.ai_tool,
    tickets: {},
  };

  state.active_ticket = ticketId;
  state.flow = flow.id;
  state.current_step = 1;
  state.tickets[ticketId] = ticketState;

  writeState(cwd, state);

  console.log(`Started ${ticketId} on flow "${flow.name}" (step 1).`);
  console.log(`  ${contextRel}`);
  console.log(`  ${auditRel}`);
  console.log(`  Branch pattern: ${branchName}`);
}
