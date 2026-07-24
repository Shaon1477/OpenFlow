import { loadConfig } from "../lib/config.js";
import { loadFlowDefinition, getStep, nextActiveStep } from "../lib/flow-loader.js";
import { readState, writeState } from "../lib/state.js";

export interface ApproveOptions {
  cwd?: string;
  ticketId?: string;
}

export function runApprove(options: ApproveOptions = {}): void {
  const cwd = options.cwd ?? process.cwd();
  const config = loadConfig(cwd);
  const state = readState(cwd);
  if (!state) {
    throw new Error("No openflow/state.json found. Run `openflow start <ticket>` first.");
  }

  const ticketId = (options.ticketId ?? state.active_ticket)?.toUpperCase();
  if (!ticketId) {
    throw new Error("No active ticket. Pass ticket id or run `openflow start`.");
  }

  const ticket = state.tickets[ticketId];
  if (!ticket) {
    throw new Error(`Ticket ${ticketId} not found in state.`);
  }

  const flow = loadFlowDefinition(state.flow || config.project.flow, cwd);
  const stepNum = state.current_step;
  const step = getStep(flow, stepNum);
  if (!step) {
    throw new Error(`Step ${stepNum} not defined in flow ${flow.id}.`);
  }

  const stepKey = String(stepNum);
  const stepState = ticket.steps[stepKey];
  if (!stepState) {
    throw new Error(`No state for step ${stepNum}.`);
  }

  if (step.optional) {
    throw new Error(`Step ${stepNum} is optional/skipped in this flow.`);
  }

  const now = new Date().toISOString();
  stepState.status = "completed";
  stepState.approved_at = now;
  stepState.completed_at = now;

  const next = nextActiveStep(flow, stepNum);
  if (next === null) {
    ticket.status = "done";
    ticket.completed_at = now;
    state.current_step = stepNum;
    state.active_ticket = null;
    console.log(`Ticket ${ticketId} completed all steps.`);
  } else {
    const nextStep = getStep(flow, next)!;
    ticket.current_step = next;
    ticket.steps[String(next)] = {
      ...ticket.steps[String(next)],
      status: "in_progress",
      started_at: now,
    };
    state.current_step = next;
    console.log(
      `Approved step ${stepNum} (${step.name}). Now on step ${next}: ${nextStep.name}.`,
    );
  }

  writeState(cwd, state);
}
