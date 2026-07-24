import {
  mkdirSync,
  writeFileSync,
  existsSync,
  copyFileSync,
  readFileSync,
  readdirSync,
  cpSync,
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

export type AiTool = "cursor" | "copilot" | "windsurf" | "claude" | "unknown";

export function detectAiTool(cwd: string): AiTool {
  if (existsSync(resolve(cwd, ".cursor"))) return "cursor";
  if (existsSync(resolve(cwd, ".windsurf"))) return "windsurf";
  if (existsSync(resolve(cwd, ".claude")) || existsSync(resolve(cwd, "CLAUDE.md")))
    return "claude";
  if (existsSync(resolve(cwd, ".github/copilot-instructions.md")))
    return "copilot";
  return "unknown";
}

function exampleConfigPath(): string {
  return join(PACKAGE_ROOT, "openflow.yml");
}

function installSkills(cwd: string, aiTool: AiTool): string[] {
  const installed: string[] = [];
  const targets: string[] = [];

  // Always install into project .cursor/skills (Cursor / Agent skills)
  targets.push(resolve(cwd, ".cursor", "skills"));
  if (aiTool === "windsurf") {
    targets.push(resolve(cwd, ".windsurf", "skills"));
  }
  if (aiTool === "claude") {
    targets.push(resolve(cwd, ".claude", "skills"));
  }

  const skillRoots = [
    join(PACKAGE_ROOT, "skills"), // openflow-* flow skills
    join(PACKAGE_ROOT, "openspec-skills"), // vendored openspec-* skills
  ];

  for (const targetRoot of targets) {
    mkdirSync(targetRoot, { recursive: true });
    for (const skillsSrc of skillRoots) {
      if (!existsSync(skillsSrc)) continue;
      for (const name of readdirSync(skillsSrc)) {
        if (name === "README.md") continue;
        const src = join(skillsSrc, name);
        const dest = join(targetRoot, name);
        cpSync(src, dest, { recursive: true });
        installed.push(`${targetRoot}/${name}`);
      }
    }
  }

  return installed;
}

function installCursorRule(cwd: string): void {
  const core = join(PACKAGE_ROOT, "openflow-rules", "core.md");
  if (!existsSync(core)) return;
  const rulesDir = resolve(cwd, ".cursor", "rules");
  mkdirSync(rulesDir, { recursive: true });
  const body = `---
description: OpenFlow SDLC orchestration — always follow when user runs OpenFlow skills
alwaysApply: true
---

${readFileSync(core, "utf8")}
`;
  writeFileSync(resolve(rulesDir, "openflow.mdc"), body, "utf8");
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

  // Clarify: project.flow is only the default; skills override per ticket
  if (!configContent.includes("# default flow")) {
    configContent = configContent.replace(
      /flow:\s*(\S+)/,
      "flow: $1  # default only — pick flow per ticket via /v5-workflow, /backend-flow, etc.",
    );
  }

  writeFileSync(configPath, configContent, "utf8");

  const installed = installSkills(cwd, aiTool);
  installCursorRule(cwd);

  const rulesHint = resolve(openflowDir, "RULES-HINT.md");
  writeFileSync(
    rulesHint,
    `# OpenFlow — once per project

\`openflow init\` is **once**. Day-to-day use **skills** in Cursor / Windsurf / Claude:

| Skill | When |
|-------|------|
| \`/openflow-v5-workflow PROD-5100\` | Full FE+BE+context+test |
| \`/openflow-backend-flow PROD-5103\` | Backend-only |
| \`/openflow-frontend-flow PROD-5102\` | Frontend-only |
| \`/openflow-mobile-flow APP-44\` | Mobile |
| \`/openflow-approve\` | Advance past human gate |
| \`/openflow-status\` | Progress |
| \`/openflow-archive PROD-5100\` | Done |
| \`/openflow-modify-step …\` | Redo from a step forward |

Edit \`openflow.yml\` for repos + tracker. Do not re-init to change flow.
`,
    "utf8",
  );

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
  if (installed.length) {
    console.log(`Installed ${installed.length} skill copies under .cursor/skills/ (and tool-specific dirs if any)`);
  }
  if (existsSync(resolve(cwd, ".cursor/rules/openflow.mdc"))) {
    console.log("Installed .cursor/rules/openflow.mdc");
  }
  console.log("Day-to-day: /openflow-v5-workflow, /openflow-backend-flow, /openflow-approve, …");

  loadConfigFromFile(configPath);
  console.log("Configuration validated.");
}
