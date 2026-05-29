import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from "date-fns";

export function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getWeekDays(weekDate: Date = new Date()): Date[] {
  const start = startOfWeek(weekDate, { weekStartsOn: 1 });
  const end = endOfWeek(weekDate, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function formatDateLabel(dateStr: string): string {
  return format(parseISO(dateStr), "EEE, MMM d");
}

export function isSameDay(a: string, b: string): boolean {
  return a === b;
}
