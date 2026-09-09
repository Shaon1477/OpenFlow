import { loadConfig } from "../lib/config.js";
import { applyDrift, computeDrift } from "../lib/drift.js";
import { loadFlowDefinition } from "../lib/flow-loader.js";
import { readState, writeState, type TicketState } from "../lib/state.js";

const MARK: Record<string, string> = {
  pending: "□",
  in_progress: "▸",
  awaiting_approval: "◇",
  completed: "✓",
  skipped: "–",
  blocked: "✗",
};

export interface StatusOptions {
  cwd?: string;
  ticketId?: string;
}

export function runStatus(options: StatusOptions = {}): void {
  const cwd = options.cwd ?? process.cwd();
  const config = loadConfig(cwd);
  const state = readState(cwd);
  if (!state) {
    console.log("No openflow/state.json — run `openflow start <ticket>`.");
    return;
  }

  const entries: [string, TicketState][] = options.ticketId
    ? [[options.ticketId.toUpperCase(), state.tickets[options.ticketId.toUpperCase()]]]
    : Object.entries(state.tickets);

  console.log(`Active ticket: ${state.active_ticket ?? "(none)"}`);
  let mutated = false;

  for (const [id, ticket] of entries) {
    if (!ticket) {
      console.log(`\nTicket ${id}: not found`);
      continue;
    }
    const flow = loadFlowDefinition(ticket.flow, cwd);
    const report = computeDrift(cwd, config, flow, id, ticket);
    if (applyDrift(ticket, report, new Date().toISOString())) mutated = true;

    console.log(`\n── ${id}: ${ticket.title} [${ticket.status}] — flow ${flow.id} ──`);
    if (Object.keys(ticket.sub_tickets).length) {
      const pairs = Object.entries(ticket.sub_tickets)
        .map(([role, value]) => `${role}=${value}`)
        .join(", ");
      console.log(`  Sub-items: ${pairs}`);
    }
    const blocker = ticket.blockers.find((entry) => !entry.cleared_at);
    if (blocker) console.log(`  Blocked: ${blocker.reason} (since ${blocker.since})`);

    for (const step of flow.steps) {
      const record = ticket.steps[step.key];
      const status = record?.status ?? "pending";
      const cursor = ticket.cursor === step.key ? " ← current" : "";
      const optional = step.optional ? " (optional)" : "";
      const stale = record?.stale ? `  ⚠ stale (${record.stale.upstream.join(", ")})` : "";
      const external = record?.external ? " [adopted]" : "";
      console.log(
        `  ${MARK[status] ?? "?"} ${step.key.padEnd(18)} ${step.name}${optional}${external}${cursor}${stale}`,
      );
    }

    if (report.modified.length) {
      console.log("  Changed since approval:");
      for (const entry of report.modified) console.log(`    ${entry.key}`);
    }
  }

  if (mutated) writeState(cwd, state);
}
