import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { expandTokens, type OpenflowConfig } from "./config.js";
import { stepArtifactTemplates, type FlowStep } from "./flow-loader.js";
import type { TicketState } from "./state.js";

const IGNORED = new Set(["node_modules", ".git", "dist", "build", ".next"]);

export function resolveStepArtifacts(
  config: OpenflowConfig,
  step: FlowStep,
  ticketId: string,
  ticket: TicketState,
): string[] {
  const templates = stepArtifactTemplates(step);
  if (!templates.length) return [];
  const role = step.role;
  const subTicket = role ? ticket.sub_tickets[role] ?? ticketId : ticketId;
  return templates.map((template) =>
    expandTokens(template, {
      ticket: ticketId,
      role,
      subTicket,
      repos: config.repos,
      artifactsDir: config.artifacts.dir,
    }),
  );
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
