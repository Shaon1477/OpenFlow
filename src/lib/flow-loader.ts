import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { z } from "zod";

const FlowStepSchema = z.object({
  id: z.number().int().min(1).max(10),
  name: z.string(),
  detail_file: z.string(),
  repos: z.array(z.string()),
  human_gate: z.boolean(),
  optional: z.boolean().optional(),
  note: z.string().optional(),
  skills: z.array(z.string()),
  rules: z.array(z.string()),
});

export const FlowDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string().optional(),
  repos: z.array(z.string()).optional(),
  steps: z.array(FlowStepSchema).min(1),
});

export type FlowDefinition = z.infer<typeof FlowDefinitionSchema>;
export type FlowStep = z.infer<typeof FlowStepSchema>;

const PACKAGE_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export function getBuiltInFlowsDir(): string {
  return join(PACKAGE_ROOT, "built-in-flows");
}

export function resolveFlowPath(flowRef: string, cwd: string): string {
  if (isAbsolute(flowRef)) return flowRef;
  if (flowRef.endsWith(".yml") || flowRef.endsWith(".yaml")) {
    const fromCwd = resolve(cwd, flowRef);
    if (existsSync(fromCwd)) return fromCwd;
  }
  const builtIn = join(getBuiltInFlowsDir(), `${flowRef}.yml`);
  if (existsSync(builtIn)) return builtIn;
  const builtInYaml = join(getBuiltInFlowsDir(), `${flowRef}.yaml`);
  if (existsSync(builtInYaml)) return builtInYaml;
  throw new Error(
    `Flow not found: ${flowRef}. Expected built-in id or path to a .yml file.`,
  );
}

export function loadFlowDefinition(
  flowRef: string,
  cwd: string = process.cwd(),
): FlowDefinition {
  const path = resolveFlowPath(flowRef, cwd);
  const raw = readFileSync(path, "utf8");
  const parsed = yaml.load(raw);
  return FlowDefinitionSchema.parse(parsed);
}

export function getStep(
  flow: FlowDefinition,
  stepNumber: number,
): FlowStep | undefined {
  return flow.steps.find((s) => s.id === stepNumber);
}

export function nextActiveStep(
  flow: FlowDefinition,
  fromStep: number,
): number | null {
  for (let id = fromStep + 1; id <= 10; id++) {
    const step = getStep(flow, id);
    if (!step) continue;
    if (step.optional) continue;
    return id;
  }
  return null;
}
