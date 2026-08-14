import { loadConfig } from "../lib/config.js";
import {
  DEFAULT_CONVENTIONS,
  missingConfiguredPacks,
  resolveAllRolePacks,
} from "../lib/rules.js";

export interface RulesOptions {
  cwd?: string;
  role?: string;
  json?: boolean;
}

/** Show which project rules OpenFlow will make the agent follow, and why. */
export function runRules(options: RulesOptions = {}): void {
  const cwd = options.cwd ?? process.cwd();
  const config = loadConfig(cwd);
  const packs = resolveAllRolePacks(cwd, config, options.role ? [options.role] : undefined);
  const missing = missingConfiguredPacks(cwd, config);

  if (options.json) {
    console.log(JSON.stringify({ packs, missing }, null, 2));
    return;
  }

  console.log(`Rule discovery: ${config.rules?.discover === false ? "off" : "on"}`);
  for (const pack of packs) {
    console.log(`\n${pack.role}:`);
    if (!pack.sources.length) {
      console.log("  (none found)");
      continue;
    }
    for (const source of pack.sources) {
      const label = source.kind === "skill" ? `skill:${source.ref}` : source.ref;
      console.log(`  ${label}  [${source.origin} · ${source.from}]`);
    }
  }

  if (missing.length) {
    console.log("\nConfigured but missing on disk:");
    for (const entry of missing) console.log(`  ${entry.role}: ${entry.entry}`);
  }

  const conventions = config.rules?.conventions ?? DEFAULT_CONVENTIONS;
  console.log("\nConventions searched when a role has no configured pack:");
  for (const convention of conventions) console.log(`  ${convention}`);
}
