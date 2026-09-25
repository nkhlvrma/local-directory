// Reasons a visitor can file against a listing. Shared by the public form,
// the server action that validates it, and the admin reports queue.
export const REPORT_REASONS = {
  closed: "Closed / no longer operating",
  wrong_info: "Wrong info",
  spam: "Spam",
  owner_update: "I own this business — please update it",
  other: "Other",
} as const;

export type ReportReason = keyof typeof REPORT_REASONS;

export function isReportReason(v: string): v is ReportReason {
  return Object.hasOwn(REPORT_REASONS, v);
}
