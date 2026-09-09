import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const PROJECT_MD = "openflow.md";

const INCOMING_KEYS: Record<string, string> = {
  "jira-tasks": "analyze",
  "frontend-implementation": "frontend",
  "backend-implementation": "backend",
  "mobile-implementation": "mobile",
  "functional-context": "context",
};

const REPO_KEYS = new Set([
  "frontend",
  "backend",
  "context",
  "test",
  "mobile",
  "data",
]);

const PLACEHOLDERS = new Set(["", "directory", "path", "…", "..."]);

export interface MdPair {
  key: string;
  value: string;
}

function unquote(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^(['"])(.*)\1$/);
  return (match ? match[2] : trimmed).trim();
}

export function parseAssignments(body: string): MdPair[] {
  const out: MdPair[] = [];
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("<!--")) continue;
    const stripped = line.replace(/^`+|`+$/g, "");
    const match = stripped.match(/^([a-z][a-z0-9_-]*)\s*[=:]\s*(.+?)\s*$/i);
    if (!match) continue;
    const value = unquote(match[2]);
    if (PLACEHOLDERS.has(value.toLowerCase())) continue;
    out.push({ key: match[1].toLowerCase(), value });
  }
  return out;
}

export function loadProjectMdPairs(cwd: string): MdPair[] {
  const filePath = resolve(cwd, PROJECT_MD);
  if (!existsSync(filePath)) return [];
  return parseAssignments(readFileSync(filePath, "utf8"));
}

export function incomingFromPairs(pairs: MdPair[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const { key, value } of pairs) {
    const engineKey = INCOMING_KEYS[key];
    if (!engineKey) continue;
    const list = map[engineKey] ?? [];
    if (!list.includes(value)) list.push(value);
    map[engineKey] = list;
  }
  return map;
}

export function configFromProjectMd(
  body: string,
  fallbackName = "my-project",
): Record<string, unknown> {
  const pairs = parseAssignments(body);
  const get = (key: string) => pairs.find((pair) => pair.key === key)?.value;

  const repos: Record<string, string> = {};
  for (const { key, value } of pairs) {
    if (REPO_KEYS.has(key)) repos[key] = value;
  }
  if (!Object.keys(repos).length) {
    throw new Error(
      `${PROJECT_MD} needs at least one repo (frontend='…', backend='…', context='…').`,
    );
  }

  const incoming = incomingFromPairs(pairs);
  const intakeProvider = get("intake") ?? "manual";
  const intakePath = get("intake-path") ?? get("tickets");

  return {
    version: 2,
    project: {
      name: get("name") ?? fallbackName,
      flow: get("workflow") ?? get("flow") ?? "default",
    },
    intake: {
      provider: intakeProvider,
      ...(intakePath ? { path: intakePath } : {}),
    },
    repos,
    context_role: repos.context ? "context" : Object.keys(repos)[0],
    branching: { pattern: "feature/{ticket}-{slug}" },
    artifacts: {
      dir: "openflow/changes",
      incoming: Object.keys(incoming).length ? incoming : undefined,
    },
    rules: { packs: {}, discover: true },
    extensions: {},
    dod: [],
  };
}

export function projectMdPath(cwd: string): string | null {
  const filePath = resolve(cwd, PROJECT_MD);
  return existsSync(filePath) ? filePath : null;
}

export const DEFAULT_PROJECT_MD = `workflow='default'
name='my-app'

frontend='../web'
backend='../api'
context='../context-docs'
test='../e2e'

jira-tasks='jira-tasks'
frontend-implementation='../web/docs'
backend-implementation='../api/docs'
functional-context='../context-docs'
`;
