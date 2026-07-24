import { mkdirSync, renameSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { readState, writeState } from "../lib/state.js";

export interface ArchiveOptions {
  cwd?: string;
  ticketId: string;
}

export function runArchive(options: ArchiveOptions): void {
  const cwd = options.cwd ?? process.cwd();
  const ticketId = options.ticketId.toUpperCase();
  const state = readState(cwd);

  if (!state || !state.tickets[ticketId]) {
    throw new Error(`Ticket ${ticketId} not found in state.`);
  }

  const ticket = state.tickets[ticketId];
  const now = new Date().toISOString();
  ticket.status = "archived";
  ticket.completed_at = ticket.completed_at ?? now;

  const changeDir = resolve(cwd, "openflow/changes", ticketId);
  const archiveRoot = resolve(cwd, "openflow/archive/changes");
  mkdirSync(archiveRoot, { recursive: true });
  const dest = resolve(archiveRoot, ticketId);

  if (existsSync(changeDir)) {
    if (existsSync(dest)) {
      throw new Error(`Archive already exists: openflow/archive/changes/${ticketId}`);
    }
    renameSync(changeDir, dest);
  }

  const marker = resolve(archiveRoot, `${ticketId}.archived.json`);
  writeFileSync(
    marker,
    JSON.stringify({ ticket_id: ticketId, archived_at: now }, null, 2) + "\n",
    "utf8",
  );

  if (state.active_ticket === ticketId) {
    state.active_ticket = null;
  }

  writeState(cwd, state);

  console.log(`Archived ${ticketId}.`);
  console.log(`  Change folder → openflow/archive/changes/${ticketId}`);
  console.log(
    "  Run OpenSpec openspec-archive-change / openspec-bulk-archive-change in each repo via AI.",
  );
}
