#!/usr/bin/env node
import { Command } from "commander";
import { runInit } from "./cli/init.js";
import { runStart } from "./cli/start.js";
import { runApprove } from "./cli/approve.js";
import { runStatus } from "./cli/status.js";
import { runArchive } from "./cli/archive.js";

const program = new Command();

program
  .name("openflow")
  .description("Multi-repo SDLC workflow state and configuration CLI")
  .version("0.1.0");

program
  .command("init")
  .description("Scaffold openflow/, write openflow.yml, detect AI tool")
  .option("-f, --force", "Overwrite existing openflow.yml")
  .option("--flow <id>", "Built-in flow id (default: v5-workflow)")
  .option("--name <name>", "Project name in openflow.yml")
  .action((opts) => {
    try {
      runInit({
        force: opts.force,
        flow: opts.flow,
        projectName: opts.name,
      });
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program
  .command("start")
  .description("Start a ticket: init state and openflow/changes/{ticket}/")
  .argument("<ticket>", "Parent ticket id (e.g. PROD-5100)")
  .option("-t, --title <title>", "Ticket title for branch slug")
  .action((ticket, opts) => {
    try {
      runStart({ ticketId: ticket, title: opts.title });
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program
  .command("approve")
  .description("Advance past human gate for the current step")
  .argument("[ticket]", "Ticket id (default: active ticket)")
  .action((ticket) => {
    try {
      runApprove({ ticketId: ticket });
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program
  .command("status")
  .description("Print workflow progress")
  .argument("[ticket]", "Ticket id (default: all tickets)")
  .action((ticket) => {
    try {
      runStatus({ ticketId: ticket });
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program
  .command("archive")
  .description("Archive ticket change folder and mark state archived")
  .argument("<ticket>", "Parent ticket id")
  .action((ticket) => {
    try {
      runArchive({ ticketId: ticket });
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program.parse();
