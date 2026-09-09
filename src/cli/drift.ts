import { loadConfig } from "../lib/config.js";
import { applyDrift, computeDrift } from "../lib/drift.js";
import { loadFlowDefinition } from "../lib/flow-loader.js";
import { appendAudit, readState, requireTicket, writeState } from "../lib/state.js";

export interface DriftOptions {
  cwd?: string;
  ticketId?: string;
  json?: boolean;
}

/**
 * Recompute artifact fingerprints and mark downstream stages stale. Run this
 * after editing anything by hand so the flow — not the developer — notices that
 * dependent work must be revisited.
 */
export function runDrift(options: DriftOptions = {}): void {
  const cwd = options.cwd ?? process.cwd();
  const config = loadConfig(cwd);
  const state = readState(cwd);
  if (!state) throw new Error("No openflow/state.json. Run `openflow start <ticket>` first.");

  const { id, ticket } = requireTicket(state, options.ticketId);
  const flow = loadFlowDefinition(ticket.flow, cwd);
  const report = computeDrift(cwd, config, flow, id, ticket);
  const now = new Date().toISOString();
  const touched = applyDrift(ticket, report, now);

  if (touched) {
    appendAudit(
      cwd,
      ticket,
      [
        "## Drift detected",
        `**Timestamp**: ${now}`,
        `**Modified**: ${report.modified.map((entry) => entry.key).join(", ") || "none"}`,
        `**Stale**: ${report.stale.map((entry) => entry.key).join(", ") || "none"}`,
      ].join("\n"),
    );
    writeState(cwd, state);
  }

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (!report.modified.length && !report.stale.length) {
    console.log(`No drift for ${id}. All approved stages match their artifacts.`);
    return;
  }

  if (report.modified.length) {
    console.log("Changed since approval:");
    for (const entry of report.modified) {
      console.log(`  ${entry.key} — ${entry.name}`);
    }
    console.log("\nAccept each change once you have reviewed it:");
    for (const entry of report.modified) {
      console.log(`  openflow approve --step ${entry.key}`);
    }
  }
  if (report.stale.length) {
    console.log("\nStale (must be re-checked):");
    for (const entry of report.stale) {
      console.log(`  ${entry.key} — ${entry.name} ← ${entry.staleFrom.join(", ")}`);
    }
    console.log(
      "\nRe-do the affected work, then `openflow approve --step <key>` for each — " +
        "including the changed stages above, or these will go stale again.",
    );
  }
}
