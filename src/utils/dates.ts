import { DateTime } from "luxon";

function createArray(num: number): number[] {
  return Array(num).fill(null);
}

export function getWeekRange(dateInput: Date): { start: string; end: string } {
  const date = DateTime.fromJSDate(dateInput);
  // Apparently, you always get string|null back from toISODate, because it might be invalid.
  // I fail to see how dateInput: Date could be an invalid date however, so here we are. 🤷‍♂️
  const start = date.startOf("week").toISODate() as string;
  const end = date.endOf("week").toISODate() as string;

  return { start, end };
}

export function getDateRangeByWeekNumberAndYear(weekNumber: number, weekYear: number) {
  const weekStart = DateTime.fromObject({ weekNumber, weekYear }).startOf("week").toISODate() as string;
  const weekEnd = DateTime.fromObject({ weekNumber, weekYear }).endOf("week").toISODate() as string;
  return { start: weekStart, end: weekEnd };
}
export type Week = { weekNumber: number; weekYear: number };

export function getPreviousWeekNumbers(date: Date, numberOfWeeks = 5): Week[] {
  const d = DateTime.fromJSDate(date);
  return createArray(numberOfWeeks).map((_, index) => {
    const previousWeek = d.minus({ weeks: index });
    return { weekNumber: previousWeek.weekNumber, weekYear: previousWeek.weekYear };
  });
}

export function getDatesInRange(startISOString: string, endISOString: string): string[] {
  const start = DateTime.fromISO(startISOString);
  const end = DateTime.fromISO(endISOString);

  const dates = [];

  for (let date = start; date <= end; date = date.plus({ days: 1 })) {
    const boop = date.isValid;
    date.day;
    if (boop) {
      const ISOString = date.toISODate();
      if (ISOString) {
        dates.push(ISOString);
      }
    }
  }
  return dates;
}

export function diffDateAndNow(date: DateTime) {
  const now = DateTime.now();
  const diff = date.diff(now.startOf("day"), ["days"]).toObject().days;
  console.log(diff);
  if (diff === 0) {
    return "| Today";
  } else if (diff === -1) {
    return "Yesterday";
  } else {
    return date.weekdayLong;
  }
}
