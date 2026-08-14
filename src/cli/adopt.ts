import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fingerprintArtifacts, resolveStepArtifacts } from "../lib/artifacts.js";
import { loadConfig } from "../lib/config.js";
import { getStep, loadFlowDefinition, nextStepKey } from "../lib/flow-loader.js";
import { appendAudit, readState, requireTicket, writeState } from "../lib/state.js";

export interface AdoptOptions {
  cwd?: string;
  ticketId?: string;
  stepKey: string;
  /** artifact paths authored elsewhere (another agent, a wiki export, a human) */
  paths?: string[];
  note?: string;
  advance?: boolean;
}

/**
 * Accept work produced outside OpenFlow — implementation docs written by another
 * agent, specs already in the repo — as a completed stage, fingerprinted so
 * later drift detection still works.
 */
export function runAdopt(options: AdoptOptions): void {
  const cwd = options.cwd ?? process.cwd();
  const config = loadConfig(cwd);
  const state = readState(cwd);
  if (!state) throw new Error("No openflow/state.json. Run `openflow start <ticket>` first.");

  const { id, ticket } = requireTicket(state, options.ticketId);
  const flow = loadFlowDefinition(ticket.flow, cwd);
  const step = getStep(flow, options.stepKey);
  if (!step) throw new Error(`Step "${options.stepKey}" is not part of flow ${flow.id}.`);

  const paths = options.paths?.length
    ? options.paths
    : resolveStepArtifacts(config, step, id, ticket);
  const missing = paths.filter((path) => !existsSync(resolve(cwd, path)));
  if (paths.length && missing.length === paths.length) {
    throw new Error(
      `None of the artifacts exist yet: ${missing.join(", ")}. Pass --path to point at the existing docs.`,
    );
  }

  const now = new Date().toISOString();
  const { hash, files } = fingerprintArtifacts(cwd, paths);
  const record = ticket.steps[step.key] ?? { status: "pending", artifacts: [] };
  record.status = "completed";
  record.completed_at = now;
  record.approved_at = now;
  record.artifacts = paths;
  record.fingerprint = hash ?? undefined;
  record.fingerprint_at = now;
  record.external = true;
  record.note = options.note ?? "adopted from existing artifacts";
  record.stale = null;
  ticket.steps[step.key] = record;

  if (options.advance !== false && ticket.cursor === step.key) {
    const next = nextStepKey(flow, step.key);
    if (next) {
      ticket.cursor = next;
      const nextRecord = ticket.steps[next] ?? { status: "pending", artifacts: [] };
      nextRecord.status = "in_progress";
      nextRecord.started_at = now;
      ticket.steps[next] = nextRecord;
    } else {
      ticket.status = "done";
      ticket.completed_at = now;
    }
  }

  appendAudit(
    cwd,
    ticket,
    [
      `## Stage adopted — ${step.name}`,
      `**Timestamp**: ${now}`,
      `**Step key**: ${step.key}`,
      `**Artifacts**: ${paths.join(", ") || "(none)"}`,
      `**Fingerprint**: ${hash ?? "none"} (${files} files)`,
      `**Note**: ${record.note}`,
    ].join("\n"),
  );
  writeState(cwd, state);

  console.log(`Adopted "${step.key}" as completed from existing artifacts.`);
  for (const path of paths) {
    console.log(`  ${existsSync(resolve(cwd, path)) ? "✓" : "missing"} ${path}`);
  }
  console.log(`Cursor: ${ticket.cursor}`);
}
