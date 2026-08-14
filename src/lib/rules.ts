import { existsSync, readdirSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import type { OpenflowConfig } from "./config.js";

export type RuleOrigin = "config" | "convention";
export type RuleKind = "file" | "skill";

export interface RuleSource {
  /** workspace-relative path, or skill name when kind === "skill" */
  ref: string;
  kind: RuleKind;
  origin: RuleOrigin;
  /** where the convention/config entry was declared */
  from: string;
}

export interface RolePack {
  role: string;
  sources: RuleSource[];
}

/**
 * Conventions searched when a role has no configured pack. `{role}` is
 * substituted. Workspace-relative entries are checked in the workspace,
 * repo-relative ones inside that role's repo.
 */
export const DEFAULT_CONVENTIONS = [
  ".openflow/rules/{role}.md",
  ".openflow/rules/{role}/",
  "openflow/rules/{role}.md",
  "openflow/rules/{role}/",
  "{repo}/.openflow/rules.md",
  "{repo}/{role}.md",
  "{repo}/AGENTS.md",
  "{repo}/CLAUDE.md",
];

const MARKDOWN = /\.(md|mdc|markdown)$/i;

function listMarkdown(dir: string, depth = 3): string[] {
  const out: string[] = [];
  if (depth < 0) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMarkdown(full, depth - 1));
    else if (MARKDOWN.test(entry.name)) out.push(full);
  }
  return out.sort();
}

function toRef(cwd: string, absPath: string): string {
  const rel = relative(cwd, absPath);
  return rel === "" ? absPath : rel;
}

function expand(
  cwd: string,
  entry: string,
  origin: RuleOrigin,
  from: string,
): RuleSource[] {
  if (entry.startsWith("skill:")) {
    return [
      { ref: entry.slice("skill:".length), kind: "skill", origin, from },
    ];
  }
  const abs = isAbsolute(entry) ? entry : resolve(cwd, entry);
  if (!existsSync(abs)) return [];
  if (statSync(abs).isDirectory()) {
    return listMarkdown(abs).map((file) => ({
      ref: toRef(cwd, file),
      kind: "file" as const,
      origin,
      from,
    }));
  }
  return [{ ref: toRef(cwd, abs), kind: "file", origin, from }];
}

/**
 * Resolve the engineering rules a role must follow. Configured packs win; when
 * a role has none and discovery is on, filename conventions are searched so a
 * team can just drop `frontend.md` (or `AGENTS.md`) into the repo.
 */
export function resolveRolePack(
  cwd: string,
  config: OpenflowConfig,
  role: string,
): RolePack {
  const configured = config.rules?.packs?.[role] ?? [];
  const sources: RuleSource[] = [];
  const seen = new Set<string>();

  const push = (found: RuleSource[]) => {
    for (const source of found) {
      const key = `${source.kind}:${source.ref}`;
      if (seen.has(key)) continue;
      seen.add(key);
      sources.push(source);
    }
  };

  for (const entry of configured) {
    push(expand(cwd, entry, "config", `rules.packs.${role}`));
  }

  if (sources.length === 0 && config.rules?.discover !== false) {
    const repoPath = config.repos[role];
    const conventions = config.rules?.conventions ?? DEFAULT_CONVENTIONS;
    for (const convention of conventions) {
      if (convention.includes("{repo}") && !repoPath) continue;
      const entry = convention
        .replace(/\{repo\}/g, repoPath ?? ".")
        .replace(/\{role\}/g, role);
      push(expand(cwd, entry, "convention", convention));
    }
  }

  return { role, sources };
}

export function resolveAllRolePacks(
  cwd: string,
  config: OpenflowConfig,
  roles?: string[],
): RolePack[] {
  const wanted = roles?.length
    ? roles
    : Array.from(
        new Set([
          ...Object.keys(config.repos),
          ...Object.keys(config.rules?.packs ?? {}),
        ]),
      );
  return wanted.map((role) => resolveRolePack(cwd, config, role));
}

/** Missing configured entries are surfaced so typos are not silently ignored. */
export function missingConfiguredPacks(
  cwd: string,
  config: OpenflowConfig,
): { role: string; entry: string }[] {
  const missing: { role: string; entry: string }[] = [];
  for (const [role, entries] of Object.entries(config.rules?.packs ?? {})) {
    for (const entry of entries) {
      if (entry.startsWith("skill:")) continue;
      const abs = isAbsolute(entry) ? entry : resolve(cwd, entry);
      if (!existsSync(abs)) missing.push({ role, entry });
    }
  }
  return missing;
}
