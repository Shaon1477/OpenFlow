import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";
import { z } from "zod";

export const DEFAULT_CONFIG_FILENAME = "openflow.yml";
export const OPENFLOW_DIR = "openflow";
export const DEFAULT_ARTIFACTS_DIR = "openflow/changes";

/**
 * Intake = where work items come from. OpenFlow never assumes Jira.
 * `manual` and `file` need no MCP; provider-backed ones are resolved by the
 * agent through whatever MCP/CLI the project has, guided by intake rules.
 */
const IntakeSchema = z
  .object({
    provider: z.string().min(1).default("manual"),
    path: z.string().optional(),
    instructions: z.string().optional(),
  })
  .passthrough();

const RulesSchema = z
  .object({
    /** role -> list of markdown files, directories, or `skill:<name>` refs */
    packs: z.record(z.array(z.string().min(1))).default({}),
    /** allow convention-based discovery when a role has no configured pack */
    discover: z.boolean().default(true),
    /** extra filename conventions searched per role, `{role}` is substituted */
    conventions: z.array(z.string().min(1)).optional(),
  })
  .default({ packs: {}, discover: true });

const DodCheckSchema = z.object({
  id: z.string().min(1),
  description: z.string().optional(),
  type: z.enum([
    "file_exists",
    "file_contains",
    "tasks_complete",
    "step_completed",
    "no_drift",
    "command",
  ]),
  /** path template, e.g. "{repo:context}/{artifacts_dir}/{sub_ticket}" */
  path: z.string().optional(),
  text: z.string().optional(),
  step: z.string().optional(),
  run: z.string().optional(),
  optional: z.boolean().optional(),
});

export type DodCheck = z.infer<typeof DodCheckSchema>;

const OpenflowConfigSchema = z
  .object({
    version: z.number().int().positive().default(2),
    project: z.object({
      name: z.string().min(1),
      flow: z.string().min(1),
    }),
    intake: IntakeSchema.optional(),
    /** legacy key kept so old configs keep working */
    tracker: z.object({ provider: z.string() }).passthrough().optional(),
    repos: z.record(z.string().min(1)).refine((r) => Object.keys(r).length > 0, {
      message: "repos must define at least one role",
    }),
    /** role whose repo stores living documentation; must exist in repos */
    context_role: z.string().min(1).default("context"),
    branching: z
      .object({ pattern: z.string().min(1) })
      .default({ pattern: "feature/{ticket}-{slug}" }),
    artifacts: z
      .object({
        /** per-repo relative dir that holds generated change artifacts */
        dir: z.string().min(1).default(DEFAULT_ARTIFACTS_DIR),
      })
      .default({ dir: DEFAULT_ARTIFACTS_DIR }),
    rules: RulesSchema,
    /** free-form opt-in engineering extensions; any name a project invents */
    extensions: z.record(z.boolean()).default({}),
    dod: z.array(DodCheckSchema).default([]),
    ai_tool: z.string().optional(),
  })
  .passthrough();

export type OpenflowConfig = z.infer<typeof OpenflowConfigSchema>;

export function findConfigPath(cwd: string): string | null {
  const direct = resolve(cwd, DEFAULT_CONFIG_FILENAME);
  return existsSync(direct) ? direct : null;
}

function normalize(config: OpenflowConfig): OpenflowConfig {
  if (!config.intake && config.tracker) {
    config.intake = { provider: config.tracker.provider };
  }
  if (!config.intake) config.intake = { provider: "manual" };
  return config;
}

export function loadConfigFromFile(filePath: string): OpenflowConfig {
  const parsed = yaml.load(readFileSync(filePath, "utf8"));
  return normalize(OpenflowConfigSchema.parse(parsed));
}

export function loadConfig(cwd: string = process.cwd()): OpenflowConfig {
  const configPath = findConfigPath(cwd);
  if (!configPath) {
    throw new Error(
      `No ${DEFAULT_CONFIG_FILENAME} found in ${cwd}. Run \`openflow init\` first.`,
    );
  }
  return loadConfigFromFile(configPath);
}

export function contextRepoRole(config: OpenflowConfig): string | null {
  const role = config.context_role;
  return config.repos[role] ? role : null;
}

export interface TokenContext {
  ticket?: string;
  slug?: string;
  role?: string;
  subTicket?: string;
  repos?: Record<string, string>;
  artifactsDir?: string;
}

/**
 * Expand `{ticket}`, `{slug}`, `{role}`, `{sub_ticket}`, `{artifacts_dir}`,
 * `{repo}` (the step's own repo) and `{repo:<role>}` in a path template.
 */
export function expandTokens(template: string, ctx: TokenContext): string {
  let out = template;
  out = out.replace(/\{repo:([a-z0-9_-]+)\}/gi, (_m, role: string) => {
    const path = ctx.repos?.[role];
    if (!path) throw new Error(`Unknown repo role "${role}" in "${template}"`);
    return path;
  });
  if (ctx.role && ctx.repos?.[ctx.role]) {
    out = out.replace(/\{repo\}/g, ctx.repos[ctx.role]);
  }
  if (ctx.ticket) out = out.replace(/\{ticket\}|\{parent\}/g, ctx.ticket);
  if (ctx.slug) out = out.replace(/\{slug\}/g, ctx.slug);
  if (ctx.role) out = out.replace(/\{role\}/g, ctx.role);
  if (ctx.subTicket) out = out.replace(/\{sub_ticket\}/g, ctx.subTicket);
  if (ctx.artifactsDir) {
    out = out.replace(/\{artifacts_dir\}/g, ctx.artifactsDir);
  }
  return out;
}

export function formatBranchPattern(
  pattern: string,
  ticketId: string,
  slug: string,
): string {
  return pattern
    .replace(/\{ticket-id\}|\{ticket\}/gi, ticketId)
    .replace(/\{slug\}/gi, slug);
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
