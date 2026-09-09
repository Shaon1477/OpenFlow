import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { z } from "zod";

/**
 * Stage kinds are the protocols OpenFlow owns. A flow composes them in any
 * order, for any role, any number of times — nothing is frontend/backend
 * specific in the engine.
 */
export const STAGE_KINDS = [
  "analyze",
  "plan",
  "implement",
  "test-cases",
  "integrate",
  "test-automation",
  "handoff",
  "sync-context",
  "custom",
] as const;

const FlowStepSchema = z
  .object({
    /** stable identifier used by state, CLI and gates */
    key: z.string().regex(/^[a-z0-9][a-z0-9._-]*$/i, "key must be slug-like"),
    name: z.string().min(1),
    kind: z.enum(STAGE_KINDS).default("custom"),
    /** repo role this stage acts on; drives rule packs and sub-ticket lookup */
    role: z.string().min(1).optional(),
    repos: z.array(z.string()).default([]),
    human_gate: z.boolean().default(true),
    optional: z.boolean().default(false),
    note: z.string().optional(),
    /** upstream step keys; used for drift + ordering checks */
    depends_on: z.array(z.string()).default([]),
    /** extra engine rule files (relative to rule-details root) */
    rules: z.array(z.string()).default([]),
    /**
     * Use another workflow's per-step file under workflow-rules/<use>/<key>.md
     * e.g. use: default
     */
    use: z.string().min(1).optional(),
    /** roles whose project rule packs must load for this stage */
    rule_packs: z.array(z.string()).optional(),
    /** OpenFlow skills the agent should run */
    skills: z.array(z.string()).default([]),
    /** path templates tracked for drift; default derives from role */
    artifacts: z.array(z.string()).optional(),
    /** stage detail file override */
    detail_file: z.string().optional(),
    verify: z.boolean().default(false),
  })
  .passthrough();

export const FlowDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  version: z.string().optional(),
  roles: z.array(z.string()).optional(),
  steps: z.array(FlowStepSchema).min(1),
});

export type FlowDefinition = z.infer<typeof FlowDefinitionSchema>;
export type FlowStep = z.infer<typeof FlowStepSchema>;

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function getBuiltInFlowsDir(): string {
  return join(PACKAGE_ROOT, "built-in-flows");
}

export function getPackageRoot(): string {
  return PACKAGE_ROOT;
}

/** Project flows win over built-ins so teams can compose their own pipeline. */
export function projectFlowDirs(cwd: string): string[] {
  return [resolve(cwd, ".openflow/flows"), resolve(cwd, "openflow/flows")];
}

export function resolveFlowPath(flowRef: string, cwd: string): string {
  if (flowRef === "v5") flowRef = "default";
  if (isAbsolute(flowRef)) {
    if (existsSync(flowRef)) return flowRef;
    throw new Error(`Flow not found: ${flowRef}`);
  }
  const candidates: string[] = [];
  if (/\.(yml|yaml)$/i.test(flowRef)) candidates.push(resolve(cwd, flowRef));
  for (const dir of projectFlowDirs(cwd)) {
    candidates.push(join(dir, `${flowRef}.yml`), join(dir, `${flowRef}.yaml`));
  }
  candidates.push(
    join(getBuiltInFlowsDir(), `${flowRef}.yml`),
    join(getBuiltInFlowsDir(), `${flowRef}.yaml`),
  );
  const found = candidates.find((candidate) => existsSync(candidate));
  if (found) return found;
  throw new Error(
    `Flow not found: ${flowRef}. Looked in .openflow/flows/, openflow/flows/, built-in flows.`,
  );
}

export function loadFlowDefinition(
  flowRef: string,
  cwd: string = process.cwd(),
): FlowDefinition {
  const path = resolveFlowPath(flowRef, cwd);
  const parsed = yaml.load(readFileSync(path, "utf8"));
  const flow = FlowDefinitionSchema.parse(parsed);

  const keys = new Set<string>();
  for (const step of flow.steps) {
    if (keys.has(step.key)) {
      throw new Error(`Duplicate step key "${step.key}" in flow ${flow.id}`);
    }
    keys.add(step.key);
  }
  for (const step of flow.steps) {
    for (const dep of step.depends_on) {
      if (!keys.has(dep)) {
        throw new Error(
          `Step "${step.key}" depends on unknown step "${dep}" in flow ${flow.id}`,
        );
      }
    }
  }
  return flow;
}

export function listFlows(cwd: string): { id: string; source: string }[] {
  const out: { id: string; source: string }[] = [];
  const dirs = [...projectFlowDirs(cwd), getBuiltInFlowsDir()];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!/\.(yml|yaml)$/i.test(file)) continue;
      const id = file.replace(/\.(yml|yaml)$/i, "");
      if (out.some((entry) => entry.id === id)) continue;
      out.push({ id, source: join(dir, file) });
    }
  }
  return out;
}

export function getStep(
  flow: FlowDefinition,
  key: string,
): FlowStep | undefined {
  return flow.steps.find((step) => step.key === key);
}

export function stepIndex(flow: FlowDefinition, key: string): number {
  return flow.steps.findIndex((step) => step.key === key);
}

export function firstStep(flow: FlowDefinition): FlowStep {
  const step = flow.steps.find((candidate) => !candidate.optional);
  return step ?? flow.steps[0];
}

export function nextStepKey(
  flow: FlowDefinition,
  fromKey: string,
): string | null {
  const index = stepIndex(flow, fromKey);
  if (index < 0) return null;
  for (let i = index + 1; i < flow.steps.length; i++) {
    if (!flow.steps[i].optional) return flow.steps[i].key;
  }
  return null;
}

/** Steps that declare `stepKey` in depends_on, directly or transitively. */
export function downstreamSteps(
  flow: FlowDefinition,
  stepKey: string,
): FlowStep[] {
  const affected = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const step of flow.steps) {
      if (affected.has(step.key)) continue;
      const hit = step.depends_on.some(
        (dep) => dep === stepKey || affected.has(dep),
      );
      if (hit) {
        affected.add(step.key);
        changed = true;
      }
    }
  }
  return flow.steps.filter((step) => affected.has(step.key));
}

/** Default artifact templates when a step does not declare its own. */
export function stepArtifactTemplates(step: FlowStep): string[] {
  if (step.artifacts?.length) return step.artifacts;
  if (!step.role) return [];
  switch (step.kind) {
    case "plan":
    case "test-cases":
    case "handoff":
    case "sync-context":
      return ["{repo}/{artifacts_dir}/{sub_ticket}"];
    case "implement":
    case "integrate":
    case "test-automation":
      return ["{repo}/{artifacts_dir}/{sub_ticket}/tasks.md"];
    default:
      return [];
  }
}
