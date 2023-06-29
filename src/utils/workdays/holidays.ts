import { DateTime } from "luxon";

const fixedHolidays = [
  { date: "01.01", name: "1. nyttårsdag" },
  { date: "01.05", name: "Offentlig høytidsdag" },
  { date: "17.05", name: "Grunnlovsdag" },
  { date: "24.12", name: "Julaften" },
  { date: "25.12", name: "1. juledag" },
  { date: "26.12", name: "2. juledag" },
  { date: "31.12", name: "Nyttårsaften" },
];

const fixedXmasDays = [
  { date: "27.12", name: "3. juledag" },
  { date: "28.12", name: "4. juledag" },
  { date: "29.12", name: "5. juledag" },
  { date: "30.12", name: "6. juledag" },
];

const movingHolidayEasterSundayOffsets = [
  { offset: -3, name: "Skjærtorsdag" },
  { offset: -2, name: "Langfredag" },
  { offset: 0, name: "1. påskedag" },
  { offset: 1, name: "2. påskedag" },
  { offset: 39, name: "Kristi himmelfartsdag" },
  { offset: 49, name: "1. pinsedag" },
  { offset: 50, name: "2. pinsedag" },
];
const easterSunday = (year: number): DateTime => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = Math.floor((h + l - 7 * m + 114) / 31);
  let p = (h + l - 7 * m + 114) % 31;
  p++;

  let temp = "";
  if (p < 10) {
    temp = 0 + "" + p;
  }

  return DateTime.fromISO(year + "-" + n.toString().padStart(2, "0") + "-" + `${temp === "" ? p : temp}`);
};

class Holiday {
  name: string;
  dateTime: DateTime;
  week: number;
  year: number;
  day: number;
  month: number;

  constructor(name: string, dateTime: DateTime) {
    this.name = name;
    this.dateTime = dateTime;
    this.week = dateTime.weekNumber;
    this.year = dateTime.year;
    this.day = dateTime.day;
    this.month = dateTime.month;
  }
}

const yearCache: { [id: string]: { [id: number]: Holiday[] } } = {};

const holidaysInYear = (year: number) => {
  const yearKey = year.toString();
  const yearHolidays = yearCache[yearKey];
  if (yearHolidays) return yearHolidays;

  const yearMap = calcHolidaysInYear(year);

  yearCache[yearKey] = yearMap;
  return yearMap;
};

const calcHolidaysInYear = (year: number): (typeof yearCache)[number] => {
  const monthMap: (typeof yearCache)[number] = {};

  Array.from({ length: 12 }, (_, i) => {
    monthMap[i + 1] = [];
  });
  const sunday = easterSunday(year);

  for (const { offset, name } of movingHolidayEasterSundayOffsets) {
    const dateTime = sunday.plus({ days: offset });
    const h = new Holiday(name, dateTime);
    monthMap[dateTime.month].push(h);
  }

  for (const { date, name } of fixedHolidays) {
    const datetime = DateTime.fromFormat(date + "." + year, "dd.MM.yyyy");
    monthMap[datetime.month].push(new Holiday(name, datetime));
  }

  for (const { date, name } of fixedXmasDays) {
    const datetime = DateTime.fromFormat(date + "." + year, "dd.MM.yyyy");
    monthMap[datetime.month].push(new Holiday(name, datetime));
  }
  return monthMap;
};

export const getHolidays = (year: number, month: number) => {
  const yearHolidays = holidaysInYear(year);
  return yearHolidays[month];
};
