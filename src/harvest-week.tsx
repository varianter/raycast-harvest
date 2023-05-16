import { List, Icon, Color, ActionPanel, Action } from "@raycast/api";
import { useHarvestWeek } from "./api";
import { DateTime } from "luxon";
import React, { useState } from "react";
import {
  diffDateAndNow,
  getDateRangeByWeekNumberAndYear,
  getDatesInRange,
  getPreviousWeekNumbers,
  Week,
} from "./utils/dates";
import HarvestHours from "./harvest-hours";

const previousWeeks = getPreviousWeekNumbers(new Date());
const currentWeek: Week = {
  weekNumber: DateTime.now().weekNumber,
  weekYear: DateTime.now().weekYear,
};

export default function Command({ selectedItem }: { selectedItem?: string | undefined }) {
  const [week, setWeekNumber] = useState<Week>(currentWeek);

  const handleWeekChange = (week: Week) => {
    setWeekNumber(week);
  };

  const { start, end } = getDateRangeByWeekNumberAndYear(week.weekNumber, week.weekYear);
  const { data, isLoading } = useHarvestWeek(start, end);
  const weekDates = getDatesInRange(start, end);
  const entries = data?.time_entries || [];

  return (
    <List
      isLoading={isLoading}
      navigationTitle="Search Harvest"
      selectedItemId={selectedItem}
      isShowingDetail={true}
      searchBarAccessory={<WeekDropdown weeks={previousWeeks} onWeekChange={handleWeekChange} />}
    >
      {weekDates.map((date) => {
        const dt = DateTime.fromISO(date);
        const dateEntries = entries.filter(({ spent_date }) => spent_date === date);
        const sumHours = dateEntries.reduce((a, b) => b.hours + a, 0);
        return (
          <List.Item
            key={date}
            id={date}
            title={`${diffDateAndNow(dt)}`}
            subtitle={`${dt.day} ${dt.monthLong}`}
            keywords={dateEntries.map((entry) => entry.client.name)}
            accessories={[{ tag: `${sumHours}h` }]}
            actions={
              <ActionPanel>
                <Action.Push title="Submit Hours" target={<HarvestHours initialDate={new Date(date)} />} />
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

function WeekDropdown(props: { weeks: Week[]; onWeekChange: (newValue: Week) => void }) {
  const { weeks, onWeekChange } = props;
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
