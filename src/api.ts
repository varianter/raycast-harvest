import { getPreferenceValues, showToast, Toast } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { ZodObject, ZodRawShape } from "zod";
import { HarvestPostTimeEntry, harvestProjectAssignments, harvestTimeEntries } from "./Schemas/Harvest";
import got from "got";
const preferences: { token: string; accountId: string; UA: string } = getPreferenceValues();

const BASE_URL = "https://api.harvestapp.com/api/v2";

const headers = {
  "Harvest-Account-ID": preferences.accountId,
  Authorization: `Bearer ${preferences.token}`,
  "User-Agent": preferences.UA,
};

/** Parse the response from the fetch query into something we can display */
function parseFetchResponse<T extends ZodRawShape>(schema: ZodObject<T>) {
  return async function (response: Response) {
    const json = await response.json();
    const result = schema.safeParse(json);
    if (!result.success) {
      showToast({
        style: Toast.Style.Failure,
        title: "Zod Parse error",
        message: String(result.error),
      });
    } else {
      return result.data;
    }
  };
}

export function useHarvest() {
  const { data, isLoading } = useFetch("https://api.harvestapp.com/api/v2/users/me/project_assignments", {
    onError: (error) => {
      console.debug(error);
    },
    parseResponse: parseFetchResponse(harvestProjectAssignments),
    headers,
    //keepPreviousData: true,
  });

  return { data, isLoading };
}

export function useHarvestWeek(from: string, to: string) {
  const { data, isLoading } = useFetch(`${BASE_URL}/time_entries?from=${from}&to=${to}`, {
    onError: (error) => {
      console.debug(error);
    },
    parseResponse: parseFetchResponse(harvestTimeEntries),
    headers,
    //keepPreviousData: true,
  });

  return { data, isLoading };
}

export async function postHarvestTime(obj: HarvestPostTimeEntry) {
  const { body } = await got.post(`${BASE_URL}/time_entries`, { headers, json: obj, responseType: "json" });
  // Vallidate API response?
  return body;
}
