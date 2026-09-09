import { fingerprintArtifacts, resolveStepArtifacts } from "../lib/artifacts.js";
import { loadConfig } from "../lib/config.js";
import { applyDrift, computeDrift } from "../lib/drift.js";
import { getStep, loadFlowDefinition, nextStepKey } from "../lib/flow-loader.js";
import { appendAudit, readState, requireTicket, writeState } from "../lib/state.js";

export interface ApproveOptions {
  cwd?: string;
  ticketId?: string;
  /** approve a specific step (used to clear stale steps out of order) */
  stepKey?: string;
  comment?: string;
}

export function runApprove(options: ApproveOptions = {}): void {
  const cwd = options.cwd ?? process.cwd();
  const config = loadConfig(cwd);
  const state = readState(cwd);
  if (!state) throw new Error("No openflow/state.json. Run `openflow start <ticket>` first.");

  const { id, ticket } = requireTicket(state, options.ticketId);
  const flow = loadFlowDefinition(ticket.flow, cwd);

  const blocker = ticket.blockers.find((entry) => !entry.cleared_at);
  if (blocker) {
    throw new Error(
      `Ticket ${id} is blocked: ${blocker.reason}. Clear it with \`openflow block --clear\` first.`,
    );
  }

  const key = options.stepKey ?? ticket.cursor;
  const step = getStep(flow, key);
  if (!step) throw new Error(`Step "${key}" is not part of flow ${flow.id}.`);
  const record = ticket.steps[key];
  if (!record) throw new Error(`No state for step "${key}".`);

  const now = new Date().toISOString();
  const paths = resolveStepArtifacts(config, step, id, ticket);
  const { hash, files } = fingerprintArtifacts(cwd, paths);

  record.status = "completed";
  record.approved_at = now;
  record.completed_at = now;
  record.artifacts = paths;
  record.fingerprint = hash ?? undefined;
  record.fingerprint_at = now;
  record.stale = null;

  const advancing = key === ticket.cursor;
  const next = advancing ? nextStepKey(flow, key) : null;

  if (advancing) {
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
      `## Gate approved — ${step.name}`,
      `**Timestamp**: ${now}`,
      `**Step key**: ${step.key}`,
      `**Artifacts**: ${paths.length ? paths.join(", ") : "(none tracked)"}`,
      `**Fingerprint**: ${hash ?? "none"} (${files} files)`,
      options.comment ? `**Comment**: ${options.comment}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  // Re-baselining one step can clear or reveal staleness elsewhere.
  applyDrift(ticket, computeDrift(cwd, config, flow, id, ticket), now);
  writeState(cwd, state);

  console.log(`Approved "${step.key}" (${step.name}).`);
  if (!paths.length) {
    console.log("  No artifacts tracked for this stage (nothing to fingerprint).");
  } else if (hash === null) {
    console.log("  Warning: no artifact files found on disk — drift cannot be tracked.");
  }
  if (advancing && next) {
    const nextStep = getStep(flow, next)!;
    console.log(`Now on "${next}" — ${nextStep.name}. Run \`openflow next\`.`);
  } else if (advancing) {
    console.log("All stages complete. Run `openflow check`, then `openflow archive`.");
  } else {
    console.log(`Cursor stays on "${ticket.cursor}".`);
  }

  const stillStale = Object.entries(ticket.steps).filter(([, value]) => value.stale);
  if (stillStale.length) {
    console.log("\nStill stale:");
    for (const [staleKey, value] of stillStale) {
      console.log(`  ${staleKey} — ${value.stale?.reason}`);
    }
  }
}
