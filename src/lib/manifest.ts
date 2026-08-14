import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { resolveStepArtifacts } from "./artifacts.js";
import type { OpenflowConfig } from "./config.js";
import { getPackageRoot, type FlowDefinition, type FlowStep } from "./flow-loader.js";
import { resolveRolePack, type RolePack } from "./rules.js";
import type { TicketState } from "./state.js";

const STAGE_DETAILS: Record<string, string> = {
  analyze: "stages/analyze.md",
  plan: "stages/plan.md",
  implement: "stages/implement.md",
  "test-cases": "stages/test-cases.md",
  integrate: "stages/integrate.md",
  "test-automation": "stages/test-automation.md",
  handoff: "stages/handoff.md",
  "sync-context": "stages/sync-context.md",
};

/** First existing rule-details root: project override wins over the package. */
export function ruleDetailsRoots(cwd: string): string[] {
  return [
    resolve(cwd, ".openflow/openflow-rule-details"),
    resolve(cwd, "openflow/openflow-rule-details"),
    join(getPackageRoot(), "openflow-rule-details"),
  ];
}

export function resolveRuleFile(cwd: string, ref: string): string {
  for (const root of ruleDetailsRoots(cwd)) {
    const candidate = resolve(root, ref);
    if (existsSync(candidate)) return candidate;
  }
  return ref;
}

export function stageDetailFile(step: FlowStep): string | null {
  if (step.detail_file) return step.detail_file;
  return STAGE_DETAILS[step.kind] ?? null;
}

export interface StepManifest {
  step: FlowStep;
  role?: string;
  subTicket?: string;
  repos: Record<string, string>;
  detailFile: string | null;
  engineRules: string[];
  rulePacks: RolePack[];
  skills: string[];
  artifacts: string[];
  humanGate: boolean;
  verify: boolean;
  stale: TicketState["steps"][string]["stale"];
}

/**
 * Everything the agent needs to execute exactly one stage: the engine protocol,
 * the project's own rule packs for that role, skills, and artifact paths.
 */
export function buildStepManifest(
  cwd: string,
  config: OpenflowConfig,
  flow: FlowDefinition,
  step: FlowStep,
  ticketId: string,
  ticket: TicketState,
): StepManifest {
  const roles = step.rule_packs ?? (step.role ? [step.role] : []);
  const repos: Record<string, string> = {};
  for (const role of step.repos.length ? step.repos : Object.keys(config.repos)) {
    if (config.repos[role]) repos[role] = config.repos[role];
  }

  const enabledExtensions = Object.entries(ticket.extensions)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name);

  const engineRules = step.rules.filter((ref) => {
    const match = ref.match(/extensions\/([a-z0-9-]+)\//i);
    if (!match) return true;
    return enabledExtensions.includes(match[1]);
  });

  return {
    step,
    role: step.role,
    subTicket: step.role ? ticket.sub_tickets[step.role] : undefined,
    repos,
    detailFile: stageDetailFile(step),
    engineRules,
    rulePacks: roles.map((role) => resolveRolePack(cwd, config, role)),
    skills: step.skills,
    artifacts: resolveStepArtifacts(config, step, ticketId, ticket),
    humanGate: step.human_gate,
    verify: step.verify,
    stale: ticket.steps[step.key]?.stale ?? null,
  };
}
