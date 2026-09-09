import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { loadConfig } from "../lib/config.js";
import { downstreamSteps, loadFlowDefinition } from "../lib/flow-loader.js";
import { parseWorkItemArg } from "../lib/ticket.js";
import { runStart } from "./start.js";
import { appendAudit, readState, requireTicket, writeState } from "../lib/state.js";

export interface CrOptions {
  cwd?: string;
  role: string;
  ticketArg: string;
  flow?: string;
  message?: string;
}

/**
 * Change request against one role of a named flow, e.g.
 * `/openflow-cr-frontend-default prod-5790` + a prompt.
 */
export function runCr(options: CrOptions): void {
  const cwd = options.cwd ?? process.cwd();
  const { ticketId, title } = parseWorkItemArg(options.ticketArg);
  const config = loadConfig(cwd);
  const flowId = options.flow ?? config.project.flow;
  const role = options.role.toLowerCase();

  let state = readState(cwd);
  if (!state?.tickets[ticketId]) {
    runStart({
      cwd,
      ticketId,
      title: title ?? ticketId,
      flow: flowId,
    });
    state = readState(cwd);
  }
  if (!state) throw new Error("No openflow/state.json after start.");

  const { ticket } = requireTicket(state, ticketId);
  const flow = loadFlowDefinition(ticket.flow, cwd);
  const target =
    flow.steps.find((step) => step.role === role && step.kind === "plan") ??
    flow.steps.find((step) => step.role === role);
  if (!target) {
    throw new Error(
      `Flow "${flow.id}" has no stage for role "${role}". Check openflow.md workflow= and .openflow/flows/.`,
    );
  }

  const now = new Date().toISOString();
  ticket.status = "active";
  ticket.cursor = target.key;
  const record = ticket.steps[target.key] ?? { status: "pending", artifacts: [] };
  record.status = "in_progress";
  record.started_at = record.started_at ?? now;
  record.stale = null;
  ticket.steps[target.key] = record;

  for (const step of downstreamSteps(flow, target.key)) {
    const downstream = ticket.steps[step.key];
    if (downstream?.status === "completed") {
      downstream.stale = {
        reason: `change request on ${role}`,
        since: now,
        upstream: [target.key],
      };
    }
  }

  state.active_ticket = ticketId;
  const crRel = `openflow/changes/${ticketId}/cr-${role}.md`;
  mkdirSync(dirname(resolve(cwd, crRel)), { recursive: true });
  const prompt = options.message?.trim() || "(describe the change in chat)";
  writeFileSync(
    resolve(cwd, crRel),
    `# Change request — ${role} (${flow.id})\n\n**Ticket**: ${ticketId}\n**Stage**: ${target.key}\n**When**: ${now}\n\n${prompt}\n`,
    "utf8",
  );
  appendAudit(
    cwd,
    ticket,
    `## Change request — ${role}\n**Timestamp**: ${now}\n**Stage**: ${target.key}\n**Prompt**: ${prompt}`,
  );
  writeState(cwd, state);

  console.log(`Change request on ${ticketId} / ${role} (flow ${flow.id}).`);
  console.log(`  Cursor: ${target.key}`);
  console.log(`  Wrote:  ${crRel}`);
  console.log("Do this stage now (implementation docs, then stop for approval).");
  if (!options.message?.trim()) {
    console.log("No prompt yet — ask in chat what should change.");
  }
}
