import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import {
  DEFAULT_CONFIG_FILENAME,
  OPENFLOW_DIR,
  loadConfigFromFile,
} from "../lib/config.js";
import { getPackageRoot, listFlows } from "../lib/flow-loader.js";
import { DEFAULT_CONVENTIONS, resolveAllRolePacks } from "../lib/rules.js";

const PACKAGE_ROOT = getPackageRoot();

export type AiTool = "cursor" | "copilot" | "windsurf" | "claude" | "codex" | "unknown";

export function detectAiTool(cwd: string): AiTool {
  if (existsSync(resolve(cwd, ".cursor"))) return "cursor";
  if (existsSync(resolve(cwd, ".windsurf"))) return "windsurf";
  if (existsSync(resolve(cwd, ".claude")) || existsSync(resolve(cwd, "CLAUDE.md")))
    return "claude";
  if (existsSync(resolve(cwd, ".codex"))) return "codex";
  if (existsSync(resolve(cwd, ".github/copilot-instructions.md"))) return "copilot";
  return "unknown";
}

function skillTargets(cwd: string, aiTool: AiTool): string[] {
  const targets = [resolve(cwd, ".cursor", "skills")];
  if (aiTool === "windsurf") targets.push(resolve(cwd, ".windsurf", "skills"));
  if (aiTool === "claude") targets.push(resolve(cwd, ".claude", "skills"));
  if (aiTool === "codex") targets.push(resolve(cwd, ".codex", "skills"));
  return targets;
}

function installSkills(cwd: string, aiTool: AiTool): number {
  const source = join(PACKAGE_ROOT, "skills");
  if (!existsSync(source)) return 0;
  let count = 0;
  for (const targetRoot of skillTargets(cwd, aiTool)) {
    mkdirSync(targetRoot, { recursive: true });
    for (const name of readdirSync(source)) {
      if (name === "README.md") continue;
      cpSync(join(source, name), join(targetRoot, name), { recursive: true });
      count++;
    }
  }
  return count;
}

function installCursorRule(cwd: string): boolean {
  const core = join(PACKAGE_ROOT, "openflow-rules", "core.md");
  if (!existsSync(core)) return false;
  const rulesDir = resolve(cwd, ".cursor", "rules");
  mkdirSync(rulesDir, { recursive: true });
  const body = `---
description: OpenFlow workflow orchestration — follow whenever an OpenFlow delivery is active
alwaysApply: true
---

${readFileSync(core, "utf8")}
`;
  writeFileSync(resolve(rulesDir, "openflow.mdc"), body, "utf8");
  return true;
}

function configTemplate(flow: string, name: string): string {
  return `version: 2

project:
  name: ${name}
  flow: ${flow} # default only — a skill or --flow can pick another flow per ticket

# Where work items come from. jira | linear | github | mcp | file | manual | none
# Provider-backed intake is executed by your agent through whatever MCP/CLI you
# already have; \`file\` is read directly by the CLI.
intake:
  provider: manual
  # path: tickets/{ticket}.md        # provider: file
  # instructions: "Use our internal tracker MCP tool workitem.get"

# Repo roles. Add or rename freely — the engine has no fixed roles.
repos:
  context: ../context-docs
  # frontend: ../web
  # backend: ../api
  # test: ../e2e

# Role whose repo stores living documentation.
context_role: context

branching:
  pattern: "feature/{ticket}-{slug}"

artifacts:
  dir: openflow/changes # per-repo folder for generated plan/spec/task artifacts

# Your engineering rules per role. Point these anywhere; if omitted, OpenFlow
# discovers conventions such as .openflow/rules/frontend.md or {repo}/AGENTS.md.
rules:
  discover: true
  packs: {}
  # packs:
  #   frontend:
  #     - .openflow/rules/frontend.md
  #     - skill:my-design-system
  #   backend:
  #     - ../api/AGENTS.md

# Opt-in engineering extensions (any name your rules define).
extensions: {}

# Executable Definition of Done. Leave empty to use the flow's defaults
# (every step approved, context docs present, no unresolved drift).
dod: []
`;
}

export interface InitOptions {
  cwd?: string;
  force?: boolean;
  flow?: string;
  projectName?: string;
}

export function runInit(options: InitOptions = {}): void {
  const cwd = options.cwd ?? process.cwd();
  const configPath = resolve(cwd, DEFAULT_CONFIG_FILENAME);
  const openflowDir = resolve(cwd, OPENFLOW_DIR);

  if (existsSync(configPath) && !options.force) {
    throw new Error(
      `${DEFAULT_CONFIG_FILENAME} already exists. Use --force to overwrite.`,
    );
  }

  mkdirSync(resolve(openflowDir, "changes"), { recursive: true });
  mkdirSync(resolve(cwd, ".openflow/rules"), { recursive: true });
  mkdirSync(resolve(cwd, ".openflow/flows"), { recursive: true });

  const aiTool = detectAiTool(cwd);
  const flow = options.flow ?? "delivery-flow";
  const name = options.projectName ?? "my-project";
  const body = `${configTemplate(flow, name)}\nai_tool: ${aiTool}\n`;
  writeFileSync(configPath, body, "utf8");

  const templates = join(PACKAGE_ROOT, "templates");
  if (existsSync(templates)) {
    cpSync(templates, resolve(openflowDir, "templates"), { recursive: true });
  }

  const skills = installSkills(cwd, aiTool);
  const ruleInstalled = installCursorRule(cwd);
  const config = loadConfigFromFile(configPath);

  console.log(`Created ${DEFAULT_CONFIG_FILENAME} (flow: ${flow})`);
  console.log(`Created ${OPENFLOW_DIR}/ and .openflow/{rules,flows}/`);
  console.log(`Detected AI tool: ${aiTool}`);
  if (skills) console.log(`Installed ${skills} skill copies`);
  if (ruleInstalled) console.log("Installed .cursor/rules/openflow.mdc");

  console.log("\nAvailable flows:");
  for (const entry of listFlows(cwd)) {
    console.log(`  ${entry.id}`);
  }

  const packs = resolveAllRolePacks(cwd, config);
  console.log("\nProject rules discovered:");
  for (const pack of packs) {
    const found = pack.sources.length
      ? pack.sources.map((source) => source.ref).join(", ")
      : "(none yet)";
    console.log(`  ${pack.role}: ${found}`);
  }
  console.log("\nDrop your own rules at any of these paths (per role):");
  for (const convention of DEFAULT_CONVENTIONS) {
    console.log(`  ${convention}`);
  }
  console.log("\nNext: edit openflow.yml (repos + intake + rules), then `openflow start <ticket>`.");
}
