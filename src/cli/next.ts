import { loadConfig } from "../lib/config.js";
import { computeDrift, applyDrift } from "../lib/drift.js";
import { getStep, loadFlowDefinition } from "../lib/flow-loader.js";
import { resolveIntake } from "../lib/intake.js";
import { buildStepManifest, resolveRuleFile } from "../lib/manifest.js";
import { readState, requireTicket, writeState } from "../lib/state.js";

export interface NextOptions {
  cwd?: string;
  ticketId?: string;
  json?: boolean;
}

/**
 * The agent's entry point each session: what stage is active, which rules to
 * load (engine + this project's own packs), which skills to run, and whether an
 * upstream change made completed work stale.
 */
export function runNext(options: NextOptions = {}): void {
  const cwd = options.cwd ?? process.cwd();
  const config = loadConfig(cwd);
  const state = readState(cwd);
  if (!state) {
    throw new Error("No openflow/state.json. Run `openflow start <ticket>` first.");
  }

  const { id, ticket } = requireTicket(state, options.ticketId);
  const flow = loadFlowDefinition(ticket.flow, cwd);

  const report = computeDrift(cwd, config, flow, id, ticket);
  if (applyDrift(ticket, report, new Date().toISOString())) writeState(cwd, state);

  const step = getStep(flow, ticket.cursor);
  if (!step) throw new Error(`Step "${ticket.cursor}" is not part of flow ${flow.id}.`);

  const manifest = buildStepManifest(cwd, config, flow, step, id, ticket);
  const activeBlocker = ticket.blockers.find((blocker) => !blocker.cleared_at);
  const intake =
    step.kind === "analyze" ? resolveIntake(cwd, config, id) : undefined;

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          ticket: id,
          flow: flow.id,
          status: ticket.status,
          blocker: activeBlocker ?? null,
          stale: report.stale,
          modified: report.modified,
          intake,
          step: {
            key: step.key,
            name: step.name,
            kind: step.kind,
            role: step.role,
            repos: manifest.repos,
            detail_file: manifest.detailFile,
            workflow_rule: manifest.workflowRule,
            engine_rules: manifest.engineRules,
            rule_packs: manifest.rulePacks,
            skills: manifest.skills,
            artifacts: manifest.artifacts,
            human_gate: manifest.humanGate,
            verify: manifest.verify,
            sub_ticket: manifest.subTicket,
          },
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`Ticket ${id} — flow ${flow.id} [${ticket.status}]`);
  if (activeBlocker) {
    console.log(`\nBLOCKED: ${activeBlocker.reason} (since ${activeBlocker.since})`);
    console.log("Resolve it, then `openflow approve` or `openflow block --clear`.");
  }

  if (report.modified.length) {
    console.log("\nChanged since approval:");
    for (const entry of report.modified) {
      console.log(`  ${entry.key} — ${entry.name}`);
    }
    console.log(
      "Review the change, then accept the new baseline: " +
        report.modified
          .map((entry) => `openflow approve --step ${entry.key}`)
          .join(" && "),
    );
  }

  if (report.stale.length) {
    console.log("\nStale work (invalidated by the changes above):");
    for (const entry of report.stale) {
      console.log(`  ${entry.key} — ${entry.name} ← ${entry.staleFrom.join(", ")}`);
    }
    console.log(
      "Re-check each one, then `openflow approve --step <key>`. Staleness clears only " +
        "after the changed stages are re-baselined too.",
    );
  }

  console.log(`\nCurrent stage: ${step.key} — ${step.name} (${step.kind})`);
  if (step.role) {
    console.log(`  Role:        ${step.role}${manifest.subTicket ? ` (${manifest.subTicket})` : ""}`);
  }
  for (const [role, path] of Object.entries(manifest.repos)) {
    console.log(`  Repo:        ${role} → ${path}`);
  }
  if (manifest.workflowRule) {
    console.log(`  Step rules:  ${manifest.workflowRule}`);
  }
  if (manifest.detailFile) {
    console.log(`  Protocol:    ${resolveRuleFile(cwd, manifest.detailFile)}`);
  }

  if (manifest.engineRules.length) {
    console.log("\nEngine rules to load:");
    for (const ref of manifest.engineRules) {
      console.log(`  ${resolveRuleFile(cwd, ref)}`);
    }
  }

  console.log("\nProject rules to follow:");
  let anyPack = false;
  for (const pack of manifest.rulePacks) {
    if (!pack.sources.length) {
      console.log(`  ${pack.role}: (none found — add .openflow/rules/${pack.role}.md or set rules.packs.${pack.role})`);
      continue;
    }
    anyPack = true;
    for (const source of pack.sources) {
      const label = source.kind === "skill" ? `skill:${source.ref}` : source.ref;
      console.log(`  ${pack.role}: ${label} [${source.origin}]`);
    }
  }
  if (!manifest.rulePacks.length) console.log("  (stage has no role-specific rules)");
  else if (!anyPack) console.log("  Falling back to engine defaults only.");

  if (manifest.skills.length) {
    console.log("\nSkills to run:");
    for (const skill of manifest.skills) console.log(`  /${skill}`);
  }
  if (manifest.artifacts.length) {
    console.log("\nArtifacts this stage owns:");
    for (const path of manifest.artifacts) console.log(`  ${path}`);
  }
  if (intake) {
    console.log(`\nIntake: ${intake.provider} (${intake.mode})`);
    for (const line of intake.instructions) console.log(`  - ${line}`);
  }

  console.log(
    manifest.humanGate
      ? "\nGate: stop after producing artifacts; wait for `openflow approve`."
      : "\nGate: none — continue to the next stage automatically.",
  );
}
