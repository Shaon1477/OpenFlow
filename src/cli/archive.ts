import { existsSync, mkdirSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import { loadConfig } from "../lib/config.js";
import { dodPassed, runDod } from "../lib/dod.js";
import { loadFlowDefinition } from "../lib/flow-loader.js";
import { appendAudit, readState, requireTicket, writeState } from "../lib/state.js";

export interface ArchiveOptions {
  cwd?: string;
  ticketId: string;
  force?: boolean;
}

/**
 * Closeout. The Definition of Done gate here is what guarantees a delivery
 * cannot quietly end with missing or stale context documentation.
 */
export function runArchive(options: ArchiveOptions): void {
  const cwd = options.cwd ?? process.cwd();
  const config = loadConfig(cwd);
  const state = readState(cwd);
  if (!state) throw new Error("No openflow/state.json. Run `openflow start <ticket>` first.");

  const { id, ticket } = requireTicket(state, options.ticketId);
  const flow = loadFlowDefinition(ticket.flow, cwd);

  const results = runDod(cwd, config, flow, id, ticket);
  const passed = dodPassed(results);
  if (!passed && !options.force) {
    console.error(`Definition of Done not met for ${id}:`);
    for (const result of results.filter((entry) => !entry.ok && !entry.optional)) {
      console.error(`  ✗ ${result.description}: ${result.detail}`);
    }
    throw new Error("Archive blocked. Finish the remaining work, or re-run with --force.");
  }

  const now = new Date().toISOString();
  const changeDir = resolve(cwd, "openflow/changes", id);
  const archiveRoot = resolve(cwd, "openflow/archive/changes");
  mkdirSync(archiveRoot, { recursive: true });
  const dest = resolve(archiveRoot, id);

  appendAudit(
    cwd,
    ticket,
    [
      "## Archived",
      `**Timestamp**: ${now}`,
      `**Definition of Done**: ${passed ? "passed" : "forced"}`,
    ].join("\n"),
  );

  if (existsSync(changeDir)) {
    if (existsSync(dest)) {
      throw new Error(`Archive already exists: openflow/archive/changes/${id}`);
    }
    renameSync(changeDir, dest);
  }

  ticket.status = "archived";
  ticket.completed_at = ticket.completed_at ?? now;
  ticket.context_file = `openflow/archive/changes/${id}/context.md`;
  ticket.audit_file = `openflow/archive/changes/${id}/audit.md`;
  if (state.active_ticket === id) state.active_ticket = null;
  writeState(cwd, state);

  console.log(`Archived ${id} → openflow/archive/changes/${id}`);
  if (!passed) console.log("Note: archived with --force despite failing Definition of Done.");
}
