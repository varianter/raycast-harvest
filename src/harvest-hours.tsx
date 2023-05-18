import { ActionPanel, Action, List, Icon } from "@raycast/api";
import { useHarvest } from "./api";
import SubmitHours from "./Forms/SubmitHours";
import { useCachedState } from "@raycast/utils";
import { HarvestProjectAssignment, TaskAssignment } from "./Schemas/Harvest";

type Favorite = HarvestProjectAssignment & TaskAssignment;

export default function Command({ initialDate = new Date() }: { initialDate: Date }) {
  const { data, isLoading } = useHarvest();
  const [favorites, setFavorites] = useCachedState<Favorite[]>("favorites", []);

  return (
    <List
      isLoading={isLoading}
      navigationTitle="Search Harvest"
      searchBarPlaceholder="Search for assignments"
      filtering={{ keepSectionOrder: true }}
    >
      <List.Section title="Favorites">
        {favorites.map((favorite) => (
          <List.Item
            key={favorite.id}
            title={`⭐\t ${favorite.task.name}`}
            subtitle={favorite.project.name}
            accessories={[{ text: favorite.client.name }]}
            keywords={[...favorite.project.name.split(" "), favorite.client.name]}
            actions={
              <ActionPanel>
                <Action.Push
                  title="Submit Hours"
                  target={
                    <SubmitHours initialDate={initialDate} projectId={favorite.project.id} taskId={favorite.task.id} />
                  }
                />
                <Action.Push
                  title="Full day"
                  target={
                    <SubmitHours
                      initialDate={initialDate}
                      projectId={favorite.project.id}
                      taskId={favorite.task.id}
                      hours="7.5"
                      skipToSubmit={true}
                    />
                  }
                />
                <Action.SubmitForm
                  title="Remove from Favorites"
                  icon={Icon.Heart}
                  shortcut={{ modifiers: ["opt"], key: "space" }}
                  onSubmit={() => {
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
        {data?.project_assignments.map((assignment) =>
          assignment.task_assignments.map((task) => (
            <List.Item
              key={task.id}
              title={task.task.name}
              subtitle={assignment.project.name}
              accessories={[{ text: assignment.client.name }]}
              keywords={[...assignment.project.name.split(" "), assignment.client.name]}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="Submit Hours"
                    target={
                      <SubmitHours initialDate={initialDate} projectId={assignment.project.id} taskId={task.task.id} />
                    }
                  />
                  <Action.Push
                    title="Full day"
                    target={
                      <SubmitHours
                        initialDate={initialDate}
                        projectId={assignment.project.id}
                        taskId={task.task.id}
                        hours="7.5"
                        skipToSubmit={true}
                      />
                    }
                  />
                  {!isFavorite(favorites, task) && (
                    <Action.SubmitForm
                      title="Add to Favorites"
                      icon={Icon.Star}
                      shortcut={{ modifiers: ["opt"], key: "space" }}
                      onSubmit={() => setFavorites([...favorites, { ...assignment, ...task }])}
                    />
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

function isFavorite(favorites: Favorite[], task: TaskAssignment) {
  return favorites.some((f) => f.id === task.id);
}
