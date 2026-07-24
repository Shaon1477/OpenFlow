import { loadConfig } from "../lib/config.js";
import { loadFlowDefinition, getStep } from "../lib/flow-loader.js";
import { readState } from "../lib/state.js";

export interface StatusOptions {
  cwd?: string;
  ticketId?: string;
}

export function runStatus(options: StatusOptions = {}): void {
  const cwd = options.cwd ?? process.cwd();
  const config = loadConfig(cwd);
  const state = readState(cwd);

  if (!state) {
    console.log("No openflow/state.json — run `openflow init` then `openflow start <ticket>`.");
    return;
  }

  const flow = loadFlowDefinition(state.flow || config.project.flow, cwd);
  const ticketId = (options.ticketId ?? state.active_ticket) ?? undefined;

  console.log(`Flow: ${flow.name} (${flow.id})`);
  console.log(`Global step: ${state.current_step}`);
  console.log(`Active ticket: ${state.active_ticket ?? "(none)"}`);
  console.log("");

  const ticketsToShow = ticketId
    ? { [ticketId]: state.tickets[ticketId] }
    : state.tickets;

  for (const [id, ticket] of Object.entries(ticketsToShow)) {
    if (!ticket) {
      console.log(`Ticket ${id}: not found`);
      continue;
    }
    console.log(`── ${id}: ${ticket.title} [${ticket.status}] ──`);
    if (ticket.sub_tickets) {
      console.log(`  Sub-tickets: ${JSON.stringify(ticket.sub_tickets)}`);
    }
    if (ticket.blockers?.length) {
      console.log(`  Blockers: ${ticket.blockers.join(", ")}`);
    }

    for (const step of flow.steps) {
      const rec = ticket.steps[String(step.id)];
      const status = rec?.status ?? "pending";
      const optional = step.optional ? " (optional)" : "";
      const current =
        ticket.current_step === step.id || state.current_step === step.id
          ? " ← current"
          : "";
      console.log(
        `  ${String(step.id).padStart(2)}. ${step.name}${optional}: ${status}${current}`,
      );
    }
    console.log("");
  }
}
