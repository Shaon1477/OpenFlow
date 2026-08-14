import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { z } from "zod";

export const STATE_VERSION = 2;
export const STATE_RELATIVE_PATH = "openflow/state.json";

const StepStatusSchema = z.enum([
  "pending",
  "in_progress",
  "awaiting_approval",
  "completed",
  "skipped",
  "blocked",
]);

const StaleSchema = z.object({
  reason: z.string(),
  since: z.string(),
  /** upstream step keys whose artifacts moved after this step was approved */
  upstream: z.array(z.string()).default([]),
});

const StepRecordSchema = z
  .object({
    status: StepStatusSchema,
    started_at: z.string().optional(),
    completed_at: z.string().optional(),
    approved_at: z.string().optional(),
    /** resolved artifact paths tracked for drift */
    artifacts: z.array(z.string()).default([]),
    fingerprint: z.string().optional(),
    fingerprint_at: z.string().optional(),
    /** true when artifacts were authored outside OpenFlow and adopted */
    external: z.boolean().optional(),
    note: z.string().optional(),
    stale: StaleSchema.nullable().optional(),
  })
  .passthrough();

const BlockerSchema = z.object({
  reason: z.string(),
  step: z.string().optional(),
  since: z.string(),
  cleared_at: z.string().optional(),
});

const TicketStateSchema = z
  .object({
    title: z.string(),
    status: z.enum(["active", "blocked", "done", "archived"]),
    flow: z.string(),
    /** current step key */
    cursor: z.string(),
    started_at: z.string(),
    completed_at: z.string().optional(),
    context_file: z.string().optional(),
    audit_file: z.string().optional(),
    sub_tickets: z.record(z.string()).default({}),
    intake: z
      .object({
        provider: z.string(),
        resolved: z.boolean().default(false),
        source: z.string().optional(),
      })
      .optional(),
    extensions: z.record(z.boolean()).default({}),
    branches: z.record(z.string()).default({}),
    blockers: z.array(BlockerSchema).default([]),
    steps: z.record(StepRecordSchema),
  })
  .passthrough();

export const OpenflowStateSchema = z.object({
  version: z.literal(STATE_VERSION),
  active_ticket: z.string().nullable().default(null),
  ai_tool: z.string().optional(),
  tickets: z.record(TicketStateSchema).default({}),
});

export type OpenflowState = z.infer<typeof OpenflowStateSchema>;
export type TicketState = z.infer<typeof TicketStateSchema>;
export type StepRecord = z.infer<typeof StepRecordSchema>;
export type StepStatus = z.infer<typeof StepStatusSchema>;

export function statePath(cwd: string): string {
  return resolve(cwd, STATE_RELATIVE_PATH);
}

export function readState(cwd: string): OpenflowState | null {
  const path = statePath(cwd);
  if (!existsSync(path)) return null;
  const raw: unknown = JSON.parse(readFileSync(path, "utf8"));
  const version = (raw as { version?: number }).version;
  if (version !== STATE_VERSION) {
    throw new Error(
      `${STATE_RELATIVE_PATH} is version ${version ?? 1}; this CLI expects ${STATE_VERSION}. ` +
        `Archive or remove the file, then run \`openflow start <ticket>\` again.`,
    );
  }
  return OpenflowStateSchema.parse(raw);
}

export function writeState(cwd: string, state: OpenflowState): void {
  const path = statePath(cwd);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export function emptyState(aiTool?: string): OpenflowState {
  return { version: STATE_VERSION, active_ticket: null, ai_tool: aiTool, tickets: {} };
}

export function initStepMap(stepKeys: string[]): Record<string, StepRecord> {
  const steps: Record<string, StepRecord> = {};
  for (const key of stepKeys) steps[key] = { status: "pending", artifacts: [] };
  return steps;
}

export function requireTicket(
  state: OpenflowState,
  ticketId?: string,
): { id: string; ticket: TicketState } {
  const id = (ticketId ?? state.active_ticket ?? "").toUpperCase();
  if (!id) {
    throw new Error("No active ticket. Pass a ticket id or run `openflow start <ticket>`.");
  }
  const ticket = state.tickets[id];
  if (!ticket) throw new Error(`Ticket ${id} not found in state.`);
  return { id, ticket };
}

export function appendAudit(
  cwd: string,
  ticket: TicketState,
  body: string,
): void {
  if (!ticket.audit_file) return;
  const path = resolve(cwd, ticket.audit_file);
  mkdirSync(dirname(path), { recursive: true });
  const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  const separator = existing.endsWith("\n") || existing === "" ? "" : "\n";
  writeFileSync(path, `${existing}${separator}\n${body.trim()}\n`, "utf8");
}

export function archiveStateFile(cwd: string, ticketId: string): string {
  const path = statePath(cwd);
  const archiveDir = resolve(cwd, "openflow/archive");
  mkdirSync(archiveDir, { recursive: true });
  const dest = resolve(archiveDir, `state-${ticketId}-${Date.now()}.json`);
  if (existsSync(path)) renameSync(path, dest);
  return dest;
}
