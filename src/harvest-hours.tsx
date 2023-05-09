import { ActionPanel, Action, List } from "@raycast/api";
import { useHarvest } from "./api";
import FormTask from "./Forms/FormTask";

export default function Command() {
  const { data, isLoading } = useHarvest();

  return (
    <List isLoading={isLoading} navigationTitle="Search Harvest" searchBarPlaceholder="Search for assignments">
      {data?.project_assignments.map((assignement) =>
        assignement.task_assignments.map((task) => (
          <List.Item
            title={task.task.name}
            subtitle={assignement.project.name}
            accessories={[{ text: assignement.client.name }]}
            keywords={[...assignement.project.name.split(" "), assignement.client.name]}
            actions={
              <ActionPanel>
                <Action.Push
                  title="Submit Hours"
                  target={<FormTask projectId={assignement.project.id} taskId={task.task.id} hours="5.5" />}
                />
                {/* <Action.Push title="Full day" /> */}
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
