import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  renameSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { z } from "zod";

const StepStatusSchema = z.enum([
  "pending",
  "in_progress",
  "awaiting_approval",
  "completed",
  "skipped",
  "blocked",
]);

const StepRecordSchema = z
  .object({
    status: StepStatusSchema,
    started_at: z.string().optional(),
    completed_at: z.string().optional(),
    approved_at: z.string().optional(),
    skill_used: z.string().optional(),
    artifacts: z.array(z.string()).optional(),
  })
  .passthrough();

const TicketStateSchema = z
  .object({
    title: z.string(),
    status: z.enum(["active", "awaiting_approval", "done", "archived"]),
    flow: z.string().optional(),
    current_step: z.number().int().min(1).max(10).optional(),
    started_at: z.string(),
    completed_at: z.string().optional(),
    context_file: z.string().optional(),
    audit_file: z.string().optional(),
    sub_tickets: z
      .object({
        frontend: z.string().optional(),
        backend: z.string().optional(),
        mobile: z.string().optional(),
        context: z.string().optional(),
        test: z.string().optional(),
      })
      .optional(),
    extensions: z
      .object({
        security: z.boolean().optional(),
        testing: z.boolean().optional(),
        resiliency: z.boolean().optional(),
      })
      .optional(),
    blockers: z.array(z.string()).optional(),
    branches: z.record(z.string()).optional(),
    steps: z.record(StepRecordSchema),
  })
  .passthrough();

export const OpenflowStateSchema = z.object({
  active_ticket: z.string().nullable().optional(),
  flow: z.string(),
  current_step: z.number().int().min(1).max(10),
  started_at: z.string(),
  ai_tool: z.string().optional(),
  tickets: z.record(TicketStateSchema),
});

export type OpenflowState = z.infer<typeof OpenflowStateSchema>;
export type TicketState = z.infer<typeof TicketStateSchema>;
export type StepStatus = z.infer<typeof StepStatusSchema>;

export const STATE_RELATIVE_PATH = "openflow/state.json";

export function statePath(cwd: string): string {
  return resolve(cwd, STATE_RELATIVE_PATH);
}

export function readState(cwd: string): OpenflowState | null {
  const path = statePath(cwd);
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, "utf8");
  return OpenflowStateSchema.parse(JSON.parse(raw));
}

export function writeState(cwd: string, state: OpenflowState): void {
  const path = statePath(cwd);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export function initStepMap(stepCount: number = 10): TicketState["steps"] {
  const steps: TicketState["steps"] = {};
  for (let i = 1; i <= stepCount; i++) {
    steps[String(i)] = { status: "pending" };
  }
  return steps;
}

export function archiveStateFile(cwd: string, ticketId: string): string {
  const path = statePath(cwd);
  const archiveDir = resolve(cwd, "openflow/archive");
  mkdirSync(archiveDir, { recursive: true });
  const dest = resolve(archiveDir, `state-${ticketId}-${Date.now()}.json`);
  if (existsSync(path)) {
    renameSync(path, dest);
  }
  return dest;
}
