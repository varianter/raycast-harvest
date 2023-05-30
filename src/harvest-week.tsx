import { List, Icon, Color, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { deleteHarvestTime, useHarvestWeek } from "./api";
import { DateTime } from "luxon";
import React, { SetStateAction, useEffect, useState } from "react";
import {
  diffDateAndNow,
  getDateRangeByWeekNumberAndYear,
  getDatesInRange,
  getPreviousWeekNumbers,
  Week,
} from "./utils/dates";
import HarvestHours from "./harvest-hours";
import { HarvestTimeEntry } from "./Schemas/Harvest";
import { useDefaultTask } from "./utils/defaultTask";
import SubmitHours from "./Forms/SubmitHours";

export default function Command({ selectedItem }: { selectedItem?: string | undefined }) {
  const today = DateTime.now();
  const currentWeek: Week = {
    weekNumber: today.weekNumber,
    weekYear: today.weekYear,
  };

  const [week, setWeekNumber] = useState<Week>(currentWeek);

  const { start, end } = getDateRangeByWeekNumberAndYear(week.weekNumber, week.weekYear);
  const weekDates = getDatesInRange(start, end);

  const { data, isLoading } = useHarvestWeek(start, end);
  const [entries, setEntries] = useState<HarvestTimeEntry[]>(data?.time_entries ?? []);
  const { defaultTask } = useDefaultTask();

  // Update entries when the data is updated by e.g. adding a new time entry.
  useEffect(() => {
    if (data) {
      setEntries(data.time_entries);
    }
  }, [data]);

  return (
    <List
      isLoading={isLoading}
      navigationTitle="Search Harvest"
      selectedItemId={selectedItem ?? today.toISODate() ?? ""}
      isShowingDetail={true}
      searchBarAccessory={<WeekDropdown dateTime={today} onWeekChange={setWeekNumber} />}
    >
      {weekDates.map((date) => {
        const dt = DateTime.fromISO(date);
        const dateEntries = entries.filter(({ spent_date }) => spent_date === date);
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
                  <Action.Push
                    title="Submit to Default Task"
                    target={
                      <SubmitHours
                        initialDate={new Date(date)}
                        projectId={defaultTask.project.id}
                        taskId={defaultTask.task.id}
                        hours="7.5"
                        skipToSubmit={true}
                      />
                    }
                  />
                )}
                <ActionPanel.Submenu title="Delete Entry" icon={Icon.Trash} shortcut={{ modifiers: ["cmd"], key: "d" }}>
                  {dateEntries.map((dateEntry) => (
                    <Action
                      key={dateEntry.id}
                      title={dateEntry.task.name}
                      onAction={async () => await handleOnDelete(dateEntry, entries, setEntries)}
                    />
                  ))}
                </ActionPanel.Submenu>
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

function WeekDropdown({ dateTime, onWeekChange }: { dateTime: DateTime; onWeekChange: (newValue: Week) => void }) {
  const weeks = getPreviousWeekNumbers(dateTime);

  return (
    <List.Dropdown
      tooltip="Select week"
      onChange={(index) => {
        // because a List.Dropdown.Item value can only ever be a string
        onWeekChange(weeks[parseInt(index)]);
      }}
    >
      <List.Dropdown.Section title="Weeks">
        {weeks.map((week, index) => (
          <List.Dropdown.Item key={week.weekNumber} title={`Week ${week.weekNumber}`} value={index.toString()} />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}

/**
 * Handles the deletion of a time entry.
 * @param dateEntry Date entry to delete
 * @param entries List of time entries
 * @param setEntries Function to set the list of entries
 */
async function handleOnDelete(
  dateEntry: HarvestTimeEntry,
  entries: HarvestTimeEntry[],
  setEntries: React.Dispatch<SetStateAction<HarvestTimeEntry[]>>
) {
  // Show loading toast
  showToast({ title: "Deleting", style: Toast.Style.Animated });

  const ok = await deleteHarvestTime(dateEntry.id);

  if (ok) {
    // Remove the deleted entry from the list of entries
    setEntries(entries.filter((entry) => entry.id !== dateEntry.id));
    showToast({
      title: "Success",
      message: `Deleted ${dateEntry.task.name}`,
      style: Toast.Style.Success,
    });
  } else {
    showToast({
      title: "Error",
      message: `Could not find ${dateEntry.task.name}`,
      style: Toast.Style.Failure,
    });
  }
}
