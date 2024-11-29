import { List, Icon, Color, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { deleteHarvestTime, postHarvestTime, useHarvestTotal, useHarvestWeek } from "./api";
import { DateTime } from "luxon";
import React, { useState } from "react";
import {
  diffDateAndNow,
  formatShortDate,
  getDateRangeByWeekNumberAndYear,
  getDatesInRange,
  getNextWeekNumber,
  getPreviousWeekNumber,
  getPreviousWeekNumbers,
  Week,
} from "./utils/dates";
import HarvestHours, { Favorite } from "./harvest-hours";
import { harvestPostTimeEntry, HarvestTimeEntry } from "./Schemas/Harvest";
import { useDefaultTask } from "./utils/defaultTask";
import { getMonthlyTotal } from "./utils/workdays";
import SubmitHours from "./Forms/SubmitHours";

export default function Command({
  selectedDate,
  selectedWeek,
}: {
  selectedDate?: string | undefined;
  selectedWeek?: Week | undefined;
}) {
  const today = DateTime.now();
  const currentWeek: Week = {
    weekNumber: today.weekNumber,
    weekYear: today.weekYear,
  };

  const [week, setWeekNumber] = useState<Week>(selectedWeek ?? currentWeek);

  const { start, end } = getDateRangeByWeekNumberAndYear(week.weekNumber, week.weekYear);
  const weekDates = getDatesInRange(start, end);

  const { data, isLoading, revalidate: revalidateTimeEntries } = useHarvestWeek(start, end);
  const { defaultTask } = useDefaultTask();
  const monthlyTotal = getMonthlyTotal(today);
  const { total: totalHours, revalidate: revalidateTotalHours } = useHarvestTotal(today);

  const revalidate = () => {
    revalidateTimeEntries();
    revalidateTotalHours();
  };

  return (
    <List
      isLoading={isLoading}
      navigationTitle={`${totalHours}h / ${monthlyTotal}h`}
      selectedItemId={selectedDate ?? today.toISODate() ?? ""}
      isShowingDetail={true}
      searchBarAccessory={<WeekDropdown currentDateTime={today} selectedWeek={week} onWeekChange={setWeekNumber} />}
    >
      {weekDates.map((date) => {
        const dt = DateTime.fromISO(date);
        const dateEntries = data?.time_entries.filter(({ spent_date }) => spent_date === date) ?? [];
        const sumHours = dateEntries.reduce((a, b) => b.hours + a, 0);

        return (
          <List.Item
            key={date}
            id={date}
            title={diffDateAndNow(dt)}
            subtitle={`${dt.day} ${dt.monthLong}`}
            keywords={dateEntries.map((entry) => entry.client.name)}
            accessories={[{ tag: `${sumHours}h` }]}
            actions={
              <ActionPanel>
                <Action.Push title="Submit Hours" target={<HarvestHours initialDate={new Date(date)} />} />
                {defaultTask && (
                  <Action
                    title="Submit to Default Task"
                    onAction={() => submitToDefault(defaultTask, new Date(date), revalidate)}
                  />
                )}
                <ActionPanel.Submenu title="Edit Entry" icon={Icon.Pencil} shortcut={{ modifiers: ["cmd"], key: "e" }}>
                  {dateEntries.map((dateEntry) => (
                    <Action.Push
                      key={dateEntry.id}
                      title={dateEntry.task.name}
                      target={
                        <SubmitHours
                          projectId={dateEntry.project.id}
                          taskId={dateEntry.task.id}
                          timeEntryId={dateEntry.id}
                          hours={dateEntry.hours.toString()}
                          notes={dateEntry.notes}
                          initialDate={new Date(dateEntry.spent_date)}
                        />
                      }
                    />
                  ))}
                </ActionPanel.Submenu>
                <ActionPanel.Submenu title="Delete Entry" icon={Icon.Trash} shortcut={{ modifiers: ["cmd"], key: "d" }}>
                  {dateEntries.map((dateEntry) => (
                    <Action
                      key={dateEntry.id}
                      title={dateEntry.task.name}
                      onAction={async () => await handleOnDelete(dateEntry, revalidate)}
                      style={Action.Style.Destructive}
                    />
                  ))}
                </ActionPanel.Submenu>
                <Action
                  title="Previous Week"
                  onAction={() => setWeekNumber(getPreviousWeekNumber(dt))}
                  icon={Icon.ArrowUpCircle}
                  shortcut={{ modifiers: ["shift"], key: "arrowUp" }}
                />
                <Action
                  title="Next Week"
                  icon={Icon.ArrowDownCircle}
                  onAction={() => setWeekNumber(getNextWeekNumber(dt))}
                  shortcut={{ modifiers: ["shift"], key: "arrowDown" }}
                />
              </ActionPanel>
            }
            detail={
              <List.Item.Detail
                metadata={
                  <List.Item.Detail.Metadata>
                    {dateEntries.map((entry) => (
                      <React.Fragment key={entry.id}>
                        <List.Item.Detail.Metadata.Label title="" text={`${dt.weekdayLong} ${dt.toISODate()}`} />
                        <List.Item.Detail.Metadata.Label title="Task" text={entry.task.name} />
                        <List.Item.Detail.Metadata.TagList title="Hours">
                          <List.Item.Detail.Metadata.TagList.Item
                            icon={Icon.Clock}
                            text={`${entry.hours.toString()}h`}
                          />
                        </List.Item.Detail.Metadata.TagList>
                        <List.Item.Detail.Metadata.TagList title="Type">
                          <List.Item.Detail.Metadata.TagList.Item
                            text={entry.client.name}
                            color={entry.client.name === "Varianttid" ? Color.Purple : "#b4d455"}
                          />
                          <List.Item.Detail.Metadata.TagList.Item text={entry.project.name} color={Color.Green} />
                        </List.Item.Detail.Metadata.TagList>
                        <List.Item.Detail.Metadata.Separator />
                      </React.Fragment>
                    ))}
                  </List.Item.Detail.Metadata>
                }
              />
            }
          />
        );
      })}
    </List>
  );
}

function WeekDropdown({
  currentDateTime,
  selectedWeek,
  onWeekChange,
}: {
  currentDateTime: DateTime;
  selectedWeek?: Week;
  onWeekChange: (newValue: Week) => void;
}) {
  const weeks = [getNextWeekNumber(currentDateTime), ...getPreviousWeekNumbers(currentDateTime)];
  const selectedWeekIndex = selectedWeek
    ? weeks
        .findIndex((w) => w.weekYear === selectedWeek.weekYear && w.weekNumber === selectedWeek.weekNumber)
        .toString()
    : undefined;

  return (
    <List.Dropdown
      tooltip="Select week"
      onChange={(index) => {
        // because a List.Dropdown.Item value can only ever be a string
        onWeekChange(weeks[parseInt(index)]);
      }}
      // Default to the current week
      defaultValue="1"
      value={selectedWeekIndex}
    >
      <List.Dropdown.Section title="Weeks">
        {weeks.map((week, index) => (
          <List.Dropdown.Item
            key={week.weekNumber}
            title={`Week ${week.weekNumber}${week.weekNumber === currentDateTime.weekNumber ? " (current)" : ""}`}
            value={index.toString()}
          />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}

/**
 * Handles the deletion of a time entry.
 * @param dateEntry Date entry to delete
 * @param revalidate
 */
async function handleOnDelete(dateEntry: HarvestTimeEntry, revalidate: () => void) {
  // Show loading toast
  await showToast({ title: "Deleting", style: Toast.Style.Animated });

  const ok = await deleteHarvestTime(dateEntry.id);

  if (ok) {
    // Remove the deleted entry from the list of entries
    revalidate();
    await showToast({
      title: "Success",
      message: `Deleted ${dateEntry.task.name}`,
      style: Toast.Style.Success,
    });
  } else {
    await showToast({
      title: "Error",
      message: `Could not find ${dateEntry.task.name}`,
      style: Toast.Style.Failure,
    });
  }
}

async function submitToDefault(task: Favorite, date: Date, revalidate: () => void) {
  const hours = "7.5";
  const result = harvestPostTimeEntry.parse({
    project_id: task.project.id,
    task_id: task.task.id,
    spent_date: date,
    hours,
  });

  try {
    await postHarvestTime(result);
    revalidate();
    await showToast({
      style: Toast.Style.Success,
      title: "Yay!",
      message: `Submitted 7.5 hours on ${formatShortDate(date)}`,
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Oh no!",
      message: `Failed to submit 7.5 hours on ${formatShortDate(date)}`,
    });
  }
}
