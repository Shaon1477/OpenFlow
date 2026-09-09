import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { OPENFLOW_DIR, PROJECT_MD_FILENAME, loadConfig } from "../lib/config.js";
import { loadFlowDefinition, getPackageRoot, listFlows } from "../lib/flow-loader.js";
import { DEFAULT_PROJECT_MD } from "../lib/project-md.js";
import { resolveAllRolePacks } from "../lib/rules.js";
import { shortFlowId } from "../lib/ticket.js";

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

function stageWork(): string {
  return `Then **do the current stage now** (do not wait for \`/openflow-run\`):

1. \`openflow next --json\`
2. Load \`workflow_rule\` (this team's per-step playbook), then the stage protocol, engine rules, and project rule packs.
3. If \`openflow next --json\` lists \`skills\`, load those (debug / verify / review). Do not run Superpowers brainstorming or executing-plans — they skip OpenFlow gates.
4. Ask in chat if anything is missing (Jira docs, Figma/MCP, screens, instruction).
5. Do exactly this one stage. Stop at the gate.
6. Tell the user to \`/openflow-approve\`. Never self-approve. Never start the next stage in this turn.`;
}

function startSkillBody(flowId: string, short: string): string {
  return `---
name: openflow-start-${short}
description: Start OpenFlow ${flowId} for a work item (e.g. /openflow-start-${short} prod-5790-trip-accept). Begins work immediately.
allowed-tools: Bash(openflow:*)
---

Start **${flowId}** and begin the first stage in this same turn.

1. \`openflow start <TICKET-OR-SLUG> --flow ${flowId}\`
   Example: \`openflow start prod-5790-trip-accept --flow ${flowId}\`
2. Jira docs in the \`jira-tasks\` folder are adopted automatically when present.

${stageWork()}
`;
}

function crSkillBody(flowId: string, short: string, role: string): string {
  return `---
name: openflow-cr-${role}-${short}
description: Change request on ${role} for OpenFlow ${flowId} (e.g. /openflow-cr-${role}-${short} prod-5790). Begins work immediately.
allowed-tools: Bash(openflow:*)
---

Change request: **${role}** of **${flowId}**, tied to the core ticket.

1. If the user already said what to change, pass it as \`-m\`. If not, ask in chat first.
2. \`openflow cr ${role} <TICKET> --flow ${flowId} -m "<their prompt>"\`

${stageWork()}
`;
}

function installSkills(cwd: string, aiTool: AiTool): number {
  const source = join(PACKAGE_ROOT, "skills");
  let count = 0;
  for (const targetRoot of skillTargets(cwd, aiTool)) {
    mkdirSync(targetRoot, { recursive: true });
    if (existsSync(source)) {
      for (const name of readdirSync(source)) {
        if (name === "README.md") continue;
        cpSync(join(source, name), join(targetRoot, name), { recursive: true });
        count++;
      }
    }
    for (const entry of listFlows(cwd)) {
      const short = shortFlowId(entry.id);
      const startDir = join(targetRoot, `openflow-start-${short}`);
      mkdirSync(startDir, { recursive: true });
      writeFileSync(join(startDir, "SKILL.md"), startSkillBody(entry.id, short), "utf8");
      count++;
      try {
        const flow = loadFlowDefinition(entry.id, cwd);
        const roles = [
          ...new Set(flow.steps.map((step) => step.role).filter(Boolean)),
        ] as string[];
        for (const role of roles) {
          const crDir = join(targetRoot, `openflow-cr-${role}-${short}`);
          mkdirSync(crDir, { recursive: true });
          writeFileSync(join(crDir, "SKILL.md"), crSkillBody(entry.id, short, role), "utf8");
          count++;
        }
      } catch {
        /* skip broken flow */
      }
    }
  }
  return count;
}

function installCursorRule(cwd: string): boolean {
  const core = join(PACKAGE_ROOT, "openflow-rules", "core.md");
  if (!existsSync(core)) return false;
  const rulesDir = resolve(cwd, ".cursor", "rules");
  mkdirSync(rulesDir, { recursive: true });
  writeFileSync(
    resolve(rulesDir, "openflow.mdc"),
    `---
description: OpenFlow workflow orchestration — follow whenever an OpenFlow delivery is active
alwaysApply: true
---

${readFileSync(core, "utf8")}
`,
    "utf8",
  );
  return true;
}

export interface InitOptions {
  cwd?: string;
  force?: boolean;
  flow?: string;
  projectName?: string;
}

export function runInit(options: InitOptions = {}): void {
  const cwd = options.cwd ?? process.cwd();
  const mdPath = resolve(cwd, PROJECT_MD_FILENAME);
  const openflowDir = resolve(cwd, OPENFLOW_DIR);

  if (existsSync(mdPath) && !options.force) {
    throw new Error(`${PROJECT_MD_FILENAME} already exists. Use --force to overwrite.`);
  }

  mkdirSync(resolve(openflowDir, "changes"), { recursive: true });
  mkdirSync(resolve(cwd, ".openflow/rules"), { recursive: true });
  mkdirSync(resolve(cwd, ".openflow/flows"), { recursive: true });
  mkdirSync(resolve(cwd, ".openflow/workflow-rules"), { recursive: true });

  const aiTool = detectAiTool(cwd);
  const flow = options.flow ?? "default";
  const name = options.projectName ?? "my-app";
  const md = DEFAULT_PROJECT_MD.replace("workflow='default'", `workflow='${flow}'`).replace(
    "name='my-app'",
    `name='${name}'`,
  );
  writeFileSync(mdPath, md, "utf8");

  const packagedRules = join(PACKAGE_ROOT, "workflow-rules");
  if (existsSync(packagedRules)) {
    const destRules = resolve(cwd, ".openflow/workflow-rules");
    for (const flowDir of readdirSync(packagedRules, { withFileTypes: true })) {
      if (!flowDir.isDirectory()) continue;
      mkdirSync(join(destRules, flowDir.name), { recursive: true });
      for (const file of readdirSync(join(packagedRules, flowDir.name))) {
        const to = join(destRules, flowDir.name, file);
        if (existsSync(to)) continue;
        cpSync(join(packagedRules, flowDir.name, file), to);
      }
    }
  }

  const templates = join(PACKAGE_ROOT, "templates");
  if (existsSync(templates)) {
    mkdirSync(resolve(openflowDir, "templates"), { recursive: true });
    for (const name of readdirSync(templates)) {
      if (name === PROJECT_MD_FILENAME || name === "openflow-directories.md") continue;
      cpSync(join(templates, name), resolve(openflowDir, "templates", name), {
        recursive: true,
      });
    }
  }

  const skills = installSkills(cwd, aiTool);
  const ruleInstalled = installCursorRule(cwd);
  const config = loadConfig(cwd);

  console.log(`Created ${PROJECT_MD_FILENAME} (workflow: ${flow})`);
  console.log(`Created ${OPENFLOW_DIR}/ and .openflow/{rules,flows,workflow-rules}/`);
  console.log(`Detected AI tool: ${aiTool}`);
  if (skills) console.log(`Installed ${skills} skill copies`);
  if (ruleInstalled) console.log("Installed .cursor/rules/openflow.mdc");
  console.log(`Created .openflow/workflow-rules/default/ (edit frontend-plan.md for PrimeVue, etc.)`);
  console.log("\nSlash commands:");
  console.log(`  /openflow-start-${shortFlowId(flow)} prod-5790-trip-accept`);
  console.log(`  /openflow-cr-frontend-${shortFlowId(flow)} prod-5790`);
  console.log("\nOwn workflow: add built-in-flows/v6.yml (or .openflow/flows/v6.yml),");
  console.log("add workflow-rules/v6/ or set `use: default` on a step. Then init --force.");

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
  console.log("\nEdit openflow.md (repos + folders), drop rules in .openflow/rules/<role>.md");
}
