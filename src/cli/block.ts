import { appendAudit, readState, requireTicket, writeState } from "../lib/state.js";

export interface BlockOptions {
  cwd?: string;
  ticketId?: string;
  reason?: string;
  clear?: boolean;
}

export function runBlock(options: BlockOptions = {}): void {
  const cwd = options.cwd ?? process.cwd();
  const state = readState(cwd);
  if (!state) throw new Error("No openflow/state.json. Run `openflow start <ticket>` first.");

  const { id, ticket } = requireTicket(state, options.ticketId);
  const now = new Date().toISOString();

  if (options.clear) {
    const open = ticket.blockers.filter((entry) => !entry.cleared_at);
    if (!open.length) {
      console.log(`No open blockers on ${id}.`);
      return;
    }
    for (const blocker of open) blocker.cleared_at = now;
    ticket.status = "active";
    appendAudit(cwd, ticket, `## Blocker cleared\n**Timestamp**: ${now}`);
    writeState(cwd, state);
    console.log(`Cleared ${open.length} blocker(s) on ${id}. Cursor: ${ticket.cursor}`);
    return;
  }

  if (!options.reason) throw new Error("Provide a reason: `openflow block \"why\"`.");

  ticket.blockers.push({ reason: options.reason, step: ticket.cursor, since: now });
  ticket.status = "blocked";
  appendAudit(
    cwd,
    ticket,
    `## Blocker\n**Timestamp**: ${now}\n**Step key**: ${ticket.cursor}\n**Reason**: ${options.reason}`,
  );
  writeState(cwd, state);
  console.log(`Blocked ${id} at "${ticket.cursor}": ${options.reason}`);
}
