import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useHarvest } from "./api";
import SubmitHours from "./Forms/SubmitHours";
import { useCachedState } from "@raycast/utils";
import { HarvestClient, HarvestProjectAssignment, TaskAssignment } from "./Schemas/Harvest";
import { useDefaultTask } from "./utils/defaultTask";
import { useState } from "react";

export type Favorite = HarvestProjectAssignment & TaskAssignment;

export default function Command({ initialDate = new Date() }: { initialDate: Date }) {
  const { data, isLoading } = useHarvest();
  const [favorites, setFavorites] = useCachedState<Favorite[]>("favorites", []);
  const { defaultTask, isDefault, setAsDefault, removeAsDefault } = useDefaultTask();

  const clients = Object.values(data?.project_assignments.reduce<{ [key: number]: HarvestClient }>((acc, curr) =>
    (curr.client.id in acc) ? acc : {
      ...acc,
      [curr.client.id]: curr.client
    }, {}) ?? {});

  const [clientId, setClientId] = useState<string | null>(null);

  return (
    <List
      isLoading={isLoading}
      navigationTitle="Search Harvest"
      searchBarPlaceholder="Search for assignments"
      searchBarAccessory={<ClientDropdown isLoading={isLoading} clients={clients} onClientIdChanged={setClientId} />}
      filtering={{ keepSectionOrder: true }}
    >
      {defaultTask && (clientId == null || defaultTask?.client.id.toString() === clientId) && (
        <List.Section title="Default Task">
          <List.Item
            key={defaultTask.id}
            title={`🌟\t ${defaultTask.task.name}`}
            subtitle={defaultTask.project.name}
            accessories={[{ text: defaultTask.client.name }]}
            keywords={[...defaultTask.project.name.split(" "), defaultTask.client.name]}
            actions={
              <ActionPanel>
                <SubmitActions
                  initialDate={initialDate}
                  projectId={defaultTask.project.id}
                  taskId={defaultTask.task.id}
                />
                <Action
                  title="Remove as Default"
                  icon={Icon.Heart}
                  shortcut={{ modifiers: ["opt", "cmd"], key: "space" }}
                  onAction={() => removeAsDefault()}
                />
              </ActionPanel>
            }
          />
        </List.Section>
      )}

      <List.Section title="Favorites">
        {favorites.filter((f) => clientId == null || f?.client.id.toString() === clientId).map((favorite) => (
          <List.Item
            key={favorite.id}
            title={`${isDefault(favorite) ? "🌟" : "⭐"}\t ${favorite.task.name}`}
            subtitle={favorite.project.name}
            accessories={[{ text: favorite.client.name }]}
            keywords={[...favorite.project.name.split(" "), favorite.client.name]}
            actions={
              <ActionPanel>
                <SubmitActions initialDate={initialDate} projectId={favorite.project.id} taskId={favorite.task.id} />
                <Action
                  title="Remove from Favorites"
                  icon={Icon.Heart}
                  shortcut={{ modifiers: ["opt"], key: "space" }}
                  onAction={() => {
                    // remove from favorites
                    const newFavorites = favorites.filter((f) => f.id !== favorite.id);
                    setFavorites(newFavorites);
                  }}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>

      <List.Section title="Assignments">
        {data?.project_assignments.filter((p) => clientId == null || p?.client.id.toString() === clientId).map((assignment) =>
          assignment.task_assignments.map((task) => (
            <List.Item
              key={task.id}
              title={task.task.name}
              subtitle={assignment.project.name}
              accessories={[{ text: assignment.client.name }]}
              keywords={[...assignment.project.name.split(" "), assignment.client.name]}
              actions={
                <ActionPanel>
                  <SubmitActions initialDate={initialDate} projectId={assignment.project.id} taskId={task.task.id} />

                  {!isFavorite(favorites, task) && (
                    <>
                      <Action
                        title="Add to Favorites"
                        icon={Icon.Star}
                        shortcut={{ modifiers: ["opt"], key: "space" }}
                        onAction={() => setFavorites([...favorites, { ...assignment, ...task }])}
                      />
                      <Action
                        title="Set as Default"
                        icon={Icon.StarCircle}
                        shortcut={{ modifiers: ["opt", "cmd"], key: "space" }}
                        onAction={async () => await setAsDefault({ ...assignment, ...task })}
                      />
                    </>
                  )}
                </ActionPanel>
              }
            />
          ))
        )}
      </List.Section>
    </List>
  );
}

const SubmitActions = ({
  initialDate,
  projectId,
  taskId,
}: {
  initialDate: Date;
  projectId: number;
  taskId: number;
}) => {
  return (
    <>
      <Action.Push
        title="Submit Hours"
        target={<SubmitHours initialDate={initialDate} projectId={projectId} taskId={taskId} />}
      />
      <Action.Push
        title="Full day"
        target={
          <SubmitHours
            initialDate={initialDate}
            projectId={projectId}
            taskId={taskId}
            hours="7.5"
            skipToSubmit={true}
          />
        }
      />
    </>
  );
};

const ClientDropdown = ({isLoading, clients, onClientIdChanged}: {isLoading: boolean, clients: HarvestClient[], onClientIdChanged: (clientId: string | null) => void}) => {

  const ALL_CLIENTS_ID = "dummyIdForAllClientsOptionMustNotMatchAnyClientIds"

  return (
    <List.Dropdown
      isLoading={isLoading}
      tooltip={"Select client"}
      defaultValue={ALL_CLIENTS_ID}
      onChange={(c) => onClientIdChanged(c === ALL_CLIENTS_ID ? null : c)}
    >
      <List.Dropdown.Item key={ALL_CLIENTS_ID} title={"All clients"} value={ALL_CLIENTS_ID} />
      {clients.map((client) => (
        <List.Dropdown.Item key={client.id} title={client.name} value={client.id.toString()} keywords={[client.id.toString()]} />
      ))}
    </List.Dropdown>
  )
}

function isFavorite(favorites: Favorite[], task: TaskAssignment) {
  return favorites.some((f) => f.id === task.id);
}
