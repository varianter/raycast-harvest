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

export function getPreviousWeekNumbers(dateTime: DateTime, numberOfWeeks = 5): Week[] {
  return createArray(numberOfWeeks).map((_, index) => {
    const previousWeek = dateTime.minus({ weeks: index });
    return { weekNumber: previousWeek.weekNumber, weekYear: previousWeek.weekYear };
  });
}

export function getNextWeekNumber(dateTime: DateTime): Week {
  const nextWeek = dateTime.plus({ weeks: 1 });
  return { weekNumber: nextWeek.weekNumber, weekYear: nextWeek.weekYear };
}

export function getPreviousWeekNumber(dateTime: DateTime): Week {
  const previousWeek = dateTime.minus({ weeks: 1 });
  return { weekNumber: previousWeek.weekNumber, weekYear: previousWeek.weekYear };
}

export function getDatesInRange(startISOString: string, endISOString: string): string[] {
  const start = DateTime.fromISO(startISOString);
  const end = DateTime.fromISO(endISOString);

  const dates = [];

  for (let date = start; date <= end; date = date.plus({ days: 1 })) {
    const { isValid } = date;

    if (isValid) {
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
  if (diff === 0) {
    return "Today";
  } else if (diff === -1) {
    return "Yesterday";
  } else {
    return date.weekdayLong ?? "";
  }
}

export function formatShortDate(date: Date | null) {
  if (date === null) return "";

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  return date.toLocaleDateString("nb-NO", dateOptions);
}
