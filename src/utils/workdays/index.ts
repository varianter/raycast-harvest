import { DateTime } from "luxon";
import { getHolidays } from "./holidays";

export const dailyWorkHours = 7.5;

export const getMonthlyTotal = (payDate: DateTime) => {
  const workDays = getWorkDaysInMonth(payDate);

  return workDays.length * dailyWorkHours;
};

const getWorkDaysInMonth = (payDate: DateTime) => {
  return getWorkdaysInMonth(payDate.year, payDate.month);
};

const getWorkdaysInMonth = (year: number, month: number) => {
  // Starting on the first day of given month
  let iteratorDate = DateTime.fromObject({ year, month, day: 1 });

  const workdaysInCurrentMonth: DateTime[] = [];

  while (iteratorDate.month === month) {
    if (iteratorDate.weekday !== 6 && iteratorDate.weekday !== 7) {
      workdaysInCurrentMonth.push(iteratorDate);
    }

    iteratorDate = iteratorDate.plus({ days: 1 });
  }

  const holidaysInMonth = getHolidays(year, month);

  return workdaysInCurrentMonth.filter((day: DateTime) => {
    return !holidaysInMonth.some((holiday) => {
      const dateDiff = holiday.dateTime.diff(day, "days");
      return dateDiff.days === 0;
    });
  });
};
