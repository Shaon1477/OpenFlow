/** Parse `prod-5790-trip-accept` → ticket PROD-5790, title "trip accept". */
export function parseWorkItemArg(raw: string): { ticketId: string; title?: string } {
  const trimmed = raw.trim();
  const match = trimmed.match(/^([A-Za-z][A-Za-z0-9]*-\d+)(?:[-_.]+(.+))?$/);
  if (!match) return { ticketId: trimmed.toUpperCase() };
  const title = match[2]?.replace(/[-_]+/g, " ").trim();
  return { ticketId: match[1].toUpperCase(), title: title || undefined };
}

export function shortFlowId(flowId: string): string {
  return flowId.replace(/-workflow$/i, "").replace(/-flow$/i, "");
}
