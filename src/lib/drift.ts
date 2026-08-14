import type { OpenflowConfig } from "./config.js";
import { fingerprintArtifacts, resolveStepArtifacts } from "./artifacts.js";
import { downstreamSteps, getStep, type FlowDefinition } from "./flow-loader.js";
import type { TicketState } from "./state.js";

export interface StepDrift {
  key: string;
  name: string;
  /** artifacts changed since this step was approved */
  modified: boolean;
  /** upstream steps whose artifacts changed after this step was approved */
  staleFrom: string[];
  currentHash: string | null;
  recordedHash: string | null;
}

export interface DriftReport {
  modified: StepDrift[];
  stale: StepDrift[];
}

/**
 * Compare recorded fingerprints to what is on disk now. A change in an upstream
 * step (e.g. backend specs edited after approval) marks every downstream step
 * stale, which is how integration work gets re-checked without the developer
 * having to announce it.
 */
export function computeDrift(
  cwd: string,
  config: OpenflowConfig,
  flow: FlowDefinition,
  ticketId: string,
  ticket: TicketState,
): DriftReport {
  const perStep = new Map<string, StepDrift>();

  for (const step of flow.steps) {
    const record = ticket.steps[step.key];
    if (!record) continue;
    const paths = resolveStepArtifacts(config, step, ticketId, ticket);
    const { hash } = fingerprintArtifacts(cwd, paths);
    const recorded = record.fingerprint ?? null;
    const tracked = record.status === "completed" && !!recorded;
    perStep.set(step.key, {
      key: step.key,
      name: step.name,
      modified: tracked && hash !== recorded,
      staleFrom: [],
      currentHash: hash,
      recordedHash: recorded,
    });
  }

  const modifiedKeys = [...perStep.values()]
    .filter((entry) => entry.modified)
    .map((entry) => entry.key);

  for (const key of modifiedKeys) {
    for (const downstream of downstreamSteps(flow, key)) {
      const record = ticket.steps[downstream.key];
      if (!record || record.status !== "completed") continue;
      const entry = perStep.get(downstream.key);
      if (!entry) continue;
      if (!entry.staleFrom.includes(key)) entry.staleFrom.push(key);
    }
  }

  const values = [...perStep.values()];
  return {
    modified: values.filter((entry) => entry.modified),
    stale: values.filter((entry) => entry.staleFrom.length > 0),
  };
}

/** Persist drift onto ticket state so `status`/`next` and gates can see it. */
export function applyDrift(
  ticket: TicketState,
  report: DriftReport,
  now: string,
): number {
  let touched = 0;
  const staleKeys = new Set(report.stale.map((entry) => entry.key));

  for (const entry of report.stale) {
    const record = ticket.steps[entry.key];
    if (!record) continue;
    const upstream = entry.staleFrom;
    const same =
      record.stale &&
      record.stale.upstream.length === upstream.length &&
      record.stale.upstream.every((key) => upstream.includes(key));
    if (same) continue;
    record.stale = {
      reason: `upstream artifacts changed: ${upstream.join(", ")}`,
      since: now,
      upstream,
    };
    touched++;
  }

  for (const [key, record] of Object.entries(ticket.steps)) {
    if (record.stale && !staleKeys.has(key)) {
      record.stale = null;
      touched++;
    }
  }
  return touched;
}

export function firstStaleStepKey(
  flow: FlowDefinition,
  ticket: TicketState,
): string | null {
  for (const step of flow.steps) {
    if (ticket.steps[step.key]?.stale) return step.key;
  }
  return null;
}

export function describeStep(flow: FlowDefinition, key: string): string {
  return getStep(flow, key)?.name ?? key;
}
