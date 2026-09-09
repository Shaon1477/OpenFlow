import { loadConfig } from "../lib/config.js";
import { dodPassed, runDod } from "../lib/dod.js";
import { loadFlowDefinition } from "../lib/flow-loader.js";
import { appendAudit, readState, requireTicket } from "../lib/state.js";

export interface CheckOptions {
  cwd?: string;
  ticketId?: string;
  json?: boolean;
  quiet?: boolean;
}

/** Run the executable Definition of Done. Exits non-zero when it fails. */
export function runCheck(options: CheckOptions = {}): boolean {
  const cwd = options.cwd ?? process.cwd();
  const config = loadConfig(cwd);
  const state = readState(cwd);
  if (!state) throw new Error("No openflow/state.json. Run `openflow start <ticket>` first.");

  const { id, ticket } = requireTicket(state, options.ticketId);
  const flow = loadFlowDefinition(ticket.flow, cwd);
  const results = runDod(cwd, config, flow, id, ticket);
  const passed = dodPassed(results);

  if (options.json) {
    console.log(JSON.stringify({ ticket: id, passed, results }, null, 2));
  } else if (!options.quiet) {
    console.log(`Definition of Done — ${id} (${config.dod.length ? "project" : "flow defaults"})`);
    for (const result of results) {
      const mark = result.ok ? "✓" : result.optional ? "~" : "✗";
      console.log(`  ${mark} ${result.description}: ${result.detail}`);
    }
    console.log(passed ? "\nAll required checks passed." : "\nDefinition of Done not met.");
  }

  appendAudit(
    cwd,
    ticket,
    [
      "## Definition of Done check",
      `**Timestamp**: ${new Date().toISOString()}`,
      `**Result**: ${passed ? "passed" : "failed"}`,
      `**Failed**: ${results.filter((r) => !r.ok && !r.optional).map((r) => r.id).join(", ") || "none"}`,
    ].join("\n"),
  );

  return passed;
}
