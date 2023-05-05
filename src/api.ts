import { getPreferenceValues, showToast, Toast } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { harvestProjectAssignments } from "./Schemas/Harvest";

const preferences: { token: string; accountId: string; UA: string } = getPreferenceValues();

const headers = {
  "Harvest-Account-ID": preferences.accountId,
  Authorization: `Bearer ${preferences.token}`,
  "User-Agent": preferences.UA,
};

/** Parse the response from the fetch query into something we can display */
async function parseFetchResponse(response: Response) {
  const result = harvestProjectAssignments.safeParse(await response.json());

  if (!result.success) {
    showToast({
      style: Toast.Style.Failure,
      title: "Zod Parse error",
      message: String(result.error),
    });
  } else {
    return result.data;
  }
}

export function useHarvest() {
  console.log(preferences);
  const { data, isLoading } = useFetch("https://api.harvestapp.com/api/v2/users/me/project_assignments", {
    onError: (error) => {
      console.debug(error);
    },
    parseResponse: parseFetchResponse,
    headers,
    // keepPreviousData: true,
  });

  return { data, isLoading };
}
