import { loadConfig } from "../lib/config.js";
import { PROJECT_MD, projectMdPath } from "../lib/project-md.js";
import { loadDirectoryMap } from "../lib/directories.js";

export interface DirsOptions {
  cwd?: string;
  json?: boolean;
}

export function runDirs(options: DirsOptions = {}): void {
  const cwd = options.cwd ?? process.cwd();
  const config = loadConfig(cwd);
  const fromFile = loadDirectoryMap(cwd);
  const fromCfg = config.artifacts.incoming ?? {};
  const keys = [...new Set([...Object.keys(fromFile), ...Object.keys(fromCfg)])].sort();

  const rows = keys.map((key) => {
    const cfg = fromCfg[key];
    const cfgPaths = cfg == null ? [] : Array.isArray(cfg) ? cfg : [cfg];
    const filePaths = fromFile[key] ?? [];
    return { key, paths: cfgPaths.length ? cfgPaths : filePaths };
  });

  if (options.json) {
    console.log(JSON.stringify({ file: projectMdPath(cwd), directories: rows }, null, 2));
    return;
  }

  console.log(projectMdPath(cwd) ? `From ${PROJECT_MD}` : `No ${PROJECT_MD} at project root.`);
  console.log("Repos:");
  for (const [role, path] of Object.entries(config.repos)) {
    console.log(`  ${role.padEnd(16)} ${path}`);
  }
  console.log(`Workflow: ${config.project.flow}`);
  if (!rows.length) {
    console.log("Doc folders: (none)");
    return;
  }
  console.log("Doc folders:");
  for (const row of rows) {
    console.log(`  ${row.key.padEnd(16)} ${row.paths.join(", ")}`);
  }
}
