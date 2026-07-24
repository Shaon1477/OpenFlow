import {
  mkdirSync,
  writeFileSync,
  existsSync,
  copyFileSync,
  readFileSync,
} from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_CONFIG_FILENAME,
  OPENFLOW_DIR,
  loadConfigFromFile,
} from "../lib/config.js";

const PACKAGE_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export type AiTool = "cursor" | "copilot" | "windsurf" | "unknown";

export function detectAiTool(cwd: string): AiTool {
  if (existsSync(resolve(cwd, ".cursor"))) return "cursor";
  if (existsSync(resolve(cwd, ".github/copilot-instructions.md")))
    return "copilot";
  if (existsSync(resolve(cwd, ".windsurf"))) return "windsurf";
  return "unknown";
}

function exampleConfigPath(): string {
  return join(PACKAGE_ROOT, "openflow.yml");
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
  const changesDir = resolve(openflowDir, "changes");

  if (existsSync(configPath) && !options.force) {
    throw new Error(
      `${DEFAULT_CONFIG_FILENAME} already exists. Use --force to overwrite.`,
    );
  }

  mkdirSync(changesDir, { recursive: true });

  let configContent: string;
  if (existsSync(exampleConfigPath())) {
    configContent = readFileSync(exampleConfigPath(), "utf8");
    if (options.flow) {
      configContent = configContent.replace(
        /flow:\s*v5-workflow/,
        `flow: ${options.flow}`,
      );
    }
    if (options.projectName) {
      configContent = configContent.replace(
        /name:\s*example/,
        `name: ${options.projectName}`,
      );
    }
  } else {
    const flow = options.flow ?? "v5-workflow";
    const name = options.projectName ?? "my-project";
    configContent = `project:\n  name: ${name}\n  flow: ${flow}\ntracker:\n  provider: jira\nrepos:\n  frontend: ../frontend\n  backend: ../backend\n  context: ../context\n  test: ../test\nbranching:\n  pattern: "feature/{ticket-id}-{slug}"\nextensions:\n  security: false\n  testing: false\n  resiliency: false\n`;
  }

  const aiTool = detectAiTool(cwd);
  if (!configContent.includes("ai_tool:")) {
    configContent = `${configContent.trimEnd()}\nai_tool: ${aiTool}\n`;
  }

  writeFileSync(configPath, configContent, "utf8");

  const rulesHint = resolve(openflowDir, "RULES-HINT.md");
  const coreRules = join(PACKAGE_ROOT, "openflow-rules", "core.md");
  const hintBody = existsSync(coreRules)
    ? `# OpenFlow rules\n\nLoad \`openflow-rules/core.md\` in your AI tool (${aiTool}).\n\nCore rules path (engine package): \`${coreRules}\`\n`
    : `# OpenFlow rules\n\nPoint your AI tool at OpenFlow \`openflow-rules/core.md\` when available (Phase 4).\n\nDetected AI tool: **${aiTool}**\n`;
  writeFileSync(rulesHint, hintBody, "utf8");

  const contextTemplate = join(PACKAGE_ROOT, "templates", "context.md");
  if (existsSync(contextTemplate)) {
    mkdirSync(resolve(openflowDir, "templates"), { recursive: true });
    copyFileSync(
      contextTemplate,
      resolve(openflowDir, "templates", "context.md"),
    );
  }

  console.log(`Created ${DEFAULT_CONFIG_FILENAME}`);
  console.log(`Created ${OPENFLOW_DIR}/ (changes/, RULES-HINT.md)`);
  console.log(`Detected AI tool: ${aiTool}`);

  loadConfigFromFile(configPath);
  console.log("Configuration validated.");
}
