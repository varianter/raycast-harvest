import { LocalStorage } from "@raycast/api";
import { useState, useEffect } from "react";
import { Favorite } from "../harvest-hours";

export const useDefaultTask = () => {
  const [defaultTask, setDefaultTask] = useState<Favorite>();

  useEffect(() => {
    (async function () {
      const item = await LocalStorage.getItem<string>("default-task");
      if (item) setDefaultTask(JSON.parse(item));
    })();
  }, []);

  const setAsDefault = async (favorite: Favorite) => {
    await LocalStorage.setItem("default-task", JSON.stringify(favorite));
    setDefaultTask(favorite);
  };

  const removeAsDefault = async () => {
    await LocalStorage.removeItem("default-task");
    setDefaultTask(undefined);
  };

  const isDefault = (favorite: Favorite) => {
    if (!defaultTask) return false;

    return defaultTask.id === favorite.id;
  };

  return {
    defaultTask,
    isDefault,
    setAsDefault,
    removeAsDefault,
  };
};
