import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { expandTokens, type OpenflowConfig } from "./config.js";

export type IntakeMode = "local" | "agent";

export interface IntakeResolution {
  provider: string;
  mode: IntakeMode;
  /** work item text when it could be read locally */
  body?: string;
  source?: string;
  /** what the agent must do when the CLI cannot fetch the item itself */
  instructions: string[];
}

const BUILT_IN_INSTRUCTIONS: Record<string, string[]> = {
  jira: [
    "Discover a Jira/Atlassian MCP server (or `jira`/`acli` CLI) and fetch the work item.",
    "Fetch parent/epic and linked issues for scope, then normalize to the ticket schema.",
  ],
  linear: [
    "Discover a Linear MCP server (or `linear` CLI) and fetch the issue by identifier.",
    "Fetch parent/project and sub-issues, then normalize to the ticket schema.",
  ],
  github: [
    "Use the GitHub MCP server or `gh issue view <id> --json ...` to fetch the issue.",
    "Follow task-list links and referenced issues for sub-scope.",
  ],
  mcp: [
    "Discover the MCP server named in `intake.server` and call its work-item read tool.",
  ],
  manual: [
    "Ask the developer to paste the work item (title, description, acceptance criteria).",
    "Write it into context.md; no external system is configured.",
  ],
  none: [
    "No intake system. Treat the developer's prompt as the work item and record it in context.md.",
  ],
};

/**
 * Resolve where the work item comes from. `file` intake is handled entirely by
 * the CLI; provider-backed intake returns instructions the agent executes with
 * whatever MCP/CLI the project has, so OpenFlow never hardcodes one tracker.
 */
export function resolveIntake(
  cwd: string,
  config: OpenflowConfig,
  ticketId: string,
): IntakeResolution {
  const intake = config.intake ?? { provider: "manual" };
  const provider = intake.provider.toLowerCase();
  const extra = intake.instructions ? [intake.instructions] : [];

  if (provider === "file") {
    const template = intake.path ?? "tickets/{ticket}.md";
    const rel = expandTokens(template, { ticket: ticketId });
    const abs = isAbsolute(rel) ? rel : resolve(cwd, rel);
    if (existsSync(abs)) {
      return {
        provider,
        mode: "local",
        body: readFileSync(abs, "utf8"),
        source: rel,
        instructions: extra,
      };
    }
    return {
      provider,
      mode: "agent",
      source: rel,
      instructions: [
        `Expected work item file not found: ${rel}.`,
        "Create it, or ask the developer for the work item and write it there.",
        ...extra,
      ],
    };
  }

  return {
    provider,
    mode: "agent",
    instructions: [
      ...(BUILT_IN_INSTRUCTIONS[provider] ?? [
        `Custom intake provider "${provider}": follow intake.instructions in openflow.yml.`,
      ]),
      ...extra,
    ],
  };
}
