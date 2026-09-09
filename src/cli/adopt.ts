import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fingerprintArtifacts, resolveAdoptArtifacts } from "../lib/artifacts.js";
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
 * When adopting analyze from incoming docs, copy them into the canonical
 * context.md later stages expect.
 */
function materializeAnalyzeContext(
  cwd: string,
  ticketId: string,
  incoming: string[],
): string | null {
  const canonicalRel = `openflow/changes/${ticketId}/context.md`;
  const canonicalAbs = resolve(cwd, canonicalRel);
  const markdown: string[] = [];
  for (const path of incoming) {
    const abs = resolve(cwd, path);
    if (!existsSync(abs)) continue;
    if (statSync(abs).isDirectory()) continue;
    if (!/\.md$/i.test(path)) continue;
    markdown.push(abs);
  }
  if (!markdown.length) return null;
  mkdirSync(dirname(canonicalAbs), { recursive: true });
  if (markdown.length === 1) {
    copyFileSync(markdown[0], canonicalAbs);
  } else {
    const body = markdown
      .map((file) => readFileSync(file, "utf8").trimEnd())
      .join("\n\n---\n\n");
    writeFileSync(canonicalAbs, `${body}\n`, "utf8");
  }
  return canonicalRel;
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

  let source: "flag" | "incoming" | "default" = "flag";
  let paths: string[];
  if (options.paths?.length) {
    paths = options.paths;
  } else {
    const resolved = resolveAdoptArtifacts(cwd, config, step, id, ticket);
    paths = resolved.paths;
    source = resolved.source;
  }

  const missing = paths.filter((path) => !existsSync(resolve(cwd, path)));
  if (paths.length && missing.length === paths.length) {
    const incomingHint = config.artifacts.incoming
      ? ` Looked in artifacts.incoming (${source}).`
      : "";
    throw new Error(
      `None of the artifacts exist yet: ${missing.join(", ")}.${incomingHint} ` +
        `Drop the ${id} docs in that folder, or pass --path.`,
    );
  }
  if (!paths.length) {
    throw new Error(
      `No artifacts found for "${step.key}". Set artifacts.incoming.${step.key} ` +
        `(or .${step.kind}) in openflow.yml, or pass --path.`,
    );
  }

  if (source !== "flag" && step.kind === "analyze") {
    const canonical = materializeAnalyzeContext(cwd, id, paths);
    if (canonical && !paths.includes(canonical)) paths = [...paths, canonical];
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
  if (source === "incoming") {
    console.log("  (from artifacts.incoming in openflow.yml)");
  }
  for (const path of paths) {
    console.log(`  ${existsSync(resolve(cwd, path)) ? "✓" : "missing"} ${path}`);
  }
  console.log(`Cursor: ${ticket.cursor}`);
}
