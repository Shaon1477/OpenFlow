import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, isAbsolute, join, relative, resolve } from "node:path";
import { expandTokens, type OpenflowConfig } from "./config.js";
import { loadDirectoryMap } from "./directories.js";
import { stepArtifactTemplates, type FlowStep } from "./flow-loader.js";
import type { TicketState } from "./state.js";

const IGNORED = new Set(["node_modules", ".git", "dist", "build", ".next"]);

function tokenCtx(
  config: OpenflowConfig,
  step: FlowStep,
  ticketId: string,
  ticket: TicketState,
) {
  const role = step.role;
  const subTicket = role ? ticket.sub_tickets[role] ?? ticketId : ticketId;
  return {
    ticket: ticketId,
    role,
    subTicket,
    repos: config.repos,
    artifactsDir: config.artifacts.dir,
  };
}

export function resolveStepArtifacts(
  config: OpenflowConfig,
  step: FlowStep,
  ticketId: string,
  ticket: TicketState,
): string[] {
  const templates = stepArtifactTemplates(step);
  if (!templates.length) return [];
  const ctx = tokenCtx(config, step, ticketId, ticket);
  return templates.map((template) => expandTokens(template, ctx));
}

function asPathList(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function incomingTemplates(
  cwd: string,
  config: OpenflowConfig,
  step: FlowStep,
): string[] {
  const fromFile = loadDirectoryMap(cwd);
  const fromYml = config.artifacts.incoming ?? {};
  const map: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(fromFile)) map[key] = [...value];
  for (const [key, value] of Object.entries(fromYml)) {
    map[key] = asPathList(value);
  }
  const refs = [step.key, step.kind, step.role].filter(
    (key): key is string => Boolean(key),
  );
  for (const key of refs) {
    if (map[key]?.length) return map[key];
  }
  return [];
}

function toRel(cwd: string, abs: string): string {
  return relative(cwd, abs).replace(/\\/g, "/");
}

function globToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i");
}

function namesMatchTicket(
  name: string,
  ticketId: string,
  subTicket?: string,
): boolean {
  const lower = name.toLowerCase();
  const needles = [ticketId, ticketId.toLowerCase()];
  if (subTicket && subTicket !== ticketId) {
    needles.push(subTicket, subTicket.toLowerCase());
  }
  return needles.some((needle) => lower.includes(needle.toLowerCase()));
}

function matchInDirectory(
  cwd: string,
  dir: string,
  ticketId: string,
  subTicket?: string,
): string[] {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  const hits: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED.has(entry.name)) continue;
    if (!namesMatchTicket(entry.name, ticketId, subTicket)) continue;
    hits.push(toRel(cwd, join(dir, entry.name)));
  }
  return hits.sort();
}

function expandIncomingRef(
  cwd: string,
  template: string,
  config: OpenflowConfig,
  step: FlowStep,
  ticketId: string,
  ticket: TicketState,
): string[] {
  const ctx = tokenCtx(config, step, ticketId, ticket);
  const variants = [
    expandTokens(template, ctx),
    expandTokens(template, { ...ctx, ticket: ticketId.toLowerCase() }),
  ];
  const seen = new Set<string>();
  const found: string[] = [];

  for (const expanded of variants) {
    if (seen.has(expanded)) continue;
    seen.add(expanded);
    const abs = isAbsolute(expanded) ? expanded : resolve(cwd, expanded);

    if (expanded.includes("*")) {
      const parent = resolve(cwd, expanded.replace(/\/[^/]*$/, "") || ".");
      const fileGlob = expanded.split("/").pop() ?? expanded;
      if (!existsSync(parent) || !statSync(parent).isDirectory()) continue;
      const re = globToRegExp(fileGlob);
      for (const entry of readdirSync(parent, { withFileTypes: true })) {
        if (entry.isFile() && re.test(entry.name)) {
          found.push(toRel(cwd, join(parent, entry.name)));
        }
      }
      continue;
    }

    if (existsSync(abs)) {
      const stats = statSync(abs);
      if (stats.isFile()) found.push(toRel(cwd, abs));
      else if (stats.isDirectory()) {
        if (namesMatchTicket(basename(abs), ticketId, ctx.subTicket)) {
          found.push(toRel(cwd, abs));
        } else {
          found.push(...matchInDirectory(cwd, abs, ticketId, ctx.subTicket));
        }
      }
      continue;
    }

    found.push(...matchInDirectory(cwd, abs, ticketId, ctx.subTicket));
  }

  return [...new Set(found)];
}

/**
 * Paths from `openflow-directories.md` (and optional `artifacts.incoming`
 * in openflow.yml). `openflow adopt` scans those folders for the ticket id.
 */
export function resolveIncomingArtifacts(
  cwd: string,
  config: OpenflowConfig,
  step: FlowStep,
  ticketId: string,
  ticket: TicketState,
): string[] {
  const templates = incomingTemplates(cwd, config, step);
  if (!templates.length) return [];
  const found: string[] = [];
  for (const template of templates) {
    found.push(
      ...expandIncomingRef(cwd, template, config, step, ticketId, ticket),
    );
  }
  return [...new Set(found)];
}

/** Paths `openflow adopt` should fingerprint when `--path` is omitted. */
export function resolveAdoptArtifacts(
  cwd: string,
  config: OpenflowConfig,
  step: FlowStep,
  ticketId: string,
  ticket: TicketState,
): { paths: string[]; source: "incoming" | "default" } {
  const incoming = resolveIncomingArtifacts(cwd, config, step, ticketId, ticket);
  if (incoming.length) return { paths: incoming, source: "incoming" };
  return {
    paths: resolveStepArtifacts(config, step, ticketId, ticket),
    source: "default",
  };
}

function hashFile(hash: ReturnType<typeof createHash>, cwd: string, file: string): void {
  hash.update(relative(cwd, file).replace(/\\/g, "/"));
  hash.update("\u0000");
  hash.update(readFileSync(file));
  hash.update("\u0000");
}

function walk(dir: string, depth = 6): string[] {
  if (depth < 0) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, depth - 1));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

/**
 * Content hash of a step's artifacts. `null` when nothing exists yet, so a
 * missing plan is distinguishable from an empty one.
 */
export function fingerprintArtifacts(
  cwd: string,
  paths: string[],
): { hash: string | null; files: number } {
  const hash = createHash("sha256");
  let files = 0;
  for (const path of [...paths].sort()) {
    const abs = isAbsolute(path) ? path : resolve(cwd, path);
    if (!existsSync(abs)) continue;
    const stats = statSync(abs);
    if (stats.isDirectory()) {
      for (const file of walk(abs).sort()) {
        hashFile(hash, cwd, file);
        files++;
      }
    } else {
      hashFile(hash, cwd, abs);
      files++;
    }
  }
  return { hash: files === 0 ? null : hash.digest("hex").slice(0, 32), files };
}

export function countTasks(cwd: string, tasksPath: string): {
  total: number;
  done: number;
} | null {
  const abs = isAbsolute(tasksPath) ? tasksPath : resolve(cwd, tasksPath);
  if (!existsSync(abs) || statSync(abs).isDirectory()) return null;
  const body = readFileSync(abs, "utf8");
  const boxes = body.match(/^\s*[-*]\s+\[( |x|X)\]/gm) ?? [];
  const done = boxes.filter((box) => /\[(x|X)\]/.test(box)).length;
  return { total: boxes.length, done };
}
