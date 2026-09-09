import { execSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { countTasks } from "./artifacts.js";
import { expandTokens, type DodCheck, type OpenflowConfig } from "./config.js";
import { computeDrift } from "./drift.js";
import type { FlowDefinition } from "./flow-loader.js";
import type { TicketState } from "./state.js";

export interface DodResult {
  id: string;
  description: string;
  ok: boolean;
  optional: boolean;
  detail: string;
}

/**
 * Default Definition of Done for flows that end in a sync-context stage: the
 * living documentation must exist and every gated step must be approved. This
 * is what stops a delivery from finishing with stale context docs.
 */
export function defaultDodChecks(
  config: OpenflowConfig,
  flow: FlowDefinition,
): DodCheck[] {
  const checks: DodCheck[] = [];
  for (const step of flow.steps) {
    if (step.optional) continue;
    checks.push({
      id: `step:${step.key}`,
      description: `${step.name} completed`,
      type: "step_completed",
      step: step.key,
    });
  }
  const syncStep = flow.steps.find((step) => step.kind === "sync-context");
  if (syncStep && config.repos[config.context_role]) {
    checks.push({
      id: "context-docs",
      description: "Living context documentation present",
      type: "file_exists",
      path: `{repo:${config.context_role}}/{artifacts_dir}/{sub_ticket}`,
    });
  }
  checks.push({
    id: "no-drift",
    description: "No stale steps from upstream changes",
    type: "no_drift",
  });
  return checks;
}

function expand(
  config: OpenflowConfig,
  ticketId: string,
  ticket: TicketState,
  template: string,
): string {
  return expandTokens(template, {
    ticket: ticketId,
    repos: config.repos,
    artifactsDir: config.artifacts.dir,
    // `{sub_ticket}` in a Definition of Done check means the context role's
    // sub-item, since that is where living documentation is filed.
    subTicket: ticket.sub_tickets[config.context_role] ?? ticketId,
  });
}

export function runDod(
  cwd: string,
  config: OpenflowConfig,
  flow: FlowDefinition,
  ticketId: string,
  ticket: TicketState,
): DodResult[] {
  const checks = config.dod.length
    ? config.dod
    : defaultDodChecks(config, flow);
  const results: DodResult[] = [];

  for (const check of checks) {
    const optional = check.optional === true;
    const description = check.description ?? check.id;
    let ok = false;
    let detail = "";

    try {
      switch (check.type) {
        case "file_exists": {
          const path = expand(config, ticketId, ticket, check.path ?? "");
          const abs = isAbsolute(path) ? path : resolve(cwd, path);
          ok = existsSync(abs);
          detail = ok ? path : `missing: ${path}`;
          break;
        }
        case "file_contains": {
          const path = expand(config, ticketId, ticket, check.path ?? "");
          const abs = isAbsolute(path) ? path : resolve(cwd, path);
          if (!existsSync(abs) || statSync(abs).isDirectory()) {
            detail = `missing: ${path}`;
            break;
          }
          ok = readFileSync(abs, "utf8").includes(check.text ?? "");
          detail = ok ? path : `"${check.text}" not found in ${path}`;
          break;
        }
        case "tasks_complete": {
          const path = expand(config, ticketId, ticket, check.path ?? "");
          const counts = countTasks(cwd, path);
          if (!counts) {
            detail = `no task list at ${path}`;
            break;
          }
          ok = counts.total > 0 && counts.done === counts.total;
          detail = `${counts.done}/${counts.total} tasks complete`;
          break;
        }
        case "step_completed": {
          const record = check.step ? ticket.steps[check.step] : undefined;
          ok = record?.status === "completed";
          detail = record ? record.status : "step not in state";
          break;
        }
        case "no_drift": {
          const report = computeDrift(cwd, config, flow, ticketId, ticket);
          ok = report.stale.length === 0;
          detail = ok
            ? "clean"
            : `stale: ${report.stale.map((entry) => entry.key).join(", ")}`;
          break;
        }
        case "command": {
          execSync(check.run ?? "true", { cwd, stdio: "pipe" });
          ok = true;
          detail = check.run ?? "";
          break;
        }
      }
    } catch (err) {
      ok = false;
      detail = err instanceof Error ? err.message.split("\n")[0] : String(err);
    }

    results.push({ id: check.id, description, ok, optional, detail });
  }

  return results;
}

export function dodPassed(results: DodResult[]): boolean {
  return results.every((result) => result.ok || result.optional);
}
