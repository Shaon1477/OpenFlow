import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";
import { z } from "zod";

const TrackerSchema = z
  .object({
    provider: z.enum(["jira", "linear", "github"]),
  })
  .passthrough();

const OpenflowConfigSchema = z.object({
  project: z.object({
    name: z.string().min(1),
    flow: z.string().min(1),
  }),
  tracker: TrackerSchema,
  repos: z
    .object({
      context: z.string().min(1),
    })
    .catchall(z.string().min(1)),
  branching: z.object({
    pattern: z.string().min(1),
  }),
  extensions: z
    .object({
      security: z.boolean().optional(),
      testing: z.boolean().optional(),
      resiliency: z.boolean().optional(),
    })
    .optional(),
  ai_tool: z.string().optional(),
});

export type OpenflowConfig = z.infer<typeof OpenflowConfigSchema>;

export const DEFAULT_CONFIG_FILENAME = "openflow.yml";
export const OPENFLOW_DIR = "openflow";

export function findConfigPath(cwd: string): string | null {
  const direct = resolve(cwd, DEFAULT_CONFIG_FILENAME);
  if (existsSync(direct)) return direct;
  return null;
}

export function loadConfig(cwd: string = process.cwd()): OpenflowConfig {
  const configPath = findConfigPath(cwd);
  if (!configPath) {
    throw new Error(
      `No ${DEFAULT_CONFIG_FILENAME} found in ${cwd}. Run \`openflow init\` first.`,
    );
  }
  const raw = readFileSync(configPath, "utf8");
  const parsed = yaml.load(raw);
  return OpenflowConfigSchema.parse(parsed);
}

export function loadConfigFromFile(filePath: string): OpenflowConfig {
  const raw = readFileSync(filePath, "utf8");
  const parsed = yaml.load(raw);
  return OpenflowConfigSchema.parse(parsed);
}

export function formatBranchPattern(
  pattern: string,
  ticketId: string,
  slug: string,
): string {
  return pattern
    .replace(/\{ticket-id\}/gi, ticketId)
    .replace(/\{slug\}/gi, slug);
}
