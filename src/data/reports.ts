import type { Report } from "../types/reports";
const KEY = "gonggam_reports_v1";
const read = (): Report[] => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value)
      ? value.filter((item): item is Report =>
          Boolean(
            item &&
            typeof item === "object" &&
            typeof (item as Report).id === "string",
          ),
        )
      : [];
  } catch {
    return [];
  }
};
const write = (items: Report[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
};
export function createReport(
  input: Omit<Report, "id" | "createdAt" | "status">,
) {
  const report: Report = {
    ...input,
    id: `report-${crypto.randomUUID?.() ?? Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "submitted",
  };
  return write([report, ...read()]) ? report : undefined;
}
export const getReportsByUser = (userId: string) =>
  read().filter((report) => report.reporterId === userId);
export const getReportForTarget = (
  reporterId: string,
  targetType: Report["targetType"],
  targetId: string,
) =>
  read().find(
    (report) =>
      report.reporterId === reporterId &&
      report.targetType === targetType &&
      report.targetId === targetId,
  );
export const reportStorageKey = KEY;
