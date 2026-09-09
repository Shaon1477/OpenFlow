import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  incomingFromPairs,
  loadProjectMdPairs,
  parseAssignments,
  PROJECT_MD,
  projectMdPath,
} from "./project-md.js";

/** @deprecated merged into openflow.md */
export const DIRECTORIES_FILENAME = "openflow-directories.md";

export function loadDirectoryMap(cwd: string): Record<string, string[]> {
  const fromMd = incomingFromPairs(loadProjectMdPairs(cwd));
  const legacy = resolve(cwd, DIRECTORIES_FILENAME);
  if (!existsSync(legacy)) return fromMd;
  const extra = incomingFromPairs(parseAssignments(readFileSync(legacy, "utf8")));
  return { ...extra, ...fromMd };
}

export function directoryFilePath(cwd: string): string | null {
  return (
    projectMdPath(cwd) ??
    (existsSync(resolve(cwd, DIRECTORIES_FILENAME))
      ? resolve(cwd, DIRECTORIES_FILENAME)
      : null)
  );
}

export { PROJECT_MD };
