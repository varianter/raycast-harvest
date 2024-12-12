import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useForm } from "@raycast/utils";
import { useEffect } from "react";
import { ZodIssue } from "zod";
import { postHarvestTime, putHarvestTime } from "../api";
import { harvestPostTimeEntry } from "../Schemas/Harvest";
import HarvestWeek from "../harvest-week";
import { formatShortDate } from "../utils/dates";
import { DateTime } from "luxon";

type FormValues = {
  hours: string;
  notes: string;
  spent_date: Date | null;
};

export default function Command({
  projectId,
  taskId,
  timeEntryId,
  hours = "7.5",
  initialDate = new Date(),
  notes = null,
  skipToSubmit = false,
}: {
  projectId: number;
  taskId: number;
  timeEntryId?: number;
  hours?: string;
  initialDate?: Date;
  notes?: string | null;
  skipToSubmit?: boolean;
}) {
  const { push } = useNavigation();
  const { handleSubmit, itemProps, setValidationError, values } = useForm<FormValues>({
    initialValues: {
      spent_date: initialDate,
      hours: hours,
      notes: notes ?? undefined,
    },
    async onSubmit(values) {
      try {
        const result = harvestPostTimeEntry.parse({ project_id: projectId, task_id: taskId, ...values });
        if (timeEntryId) {
          await putHarvestTime(timeEntryId, result);
        } else {
          await postHarvestTime(result);
        }
        showToast({
          style: Toast.Style.Success,
          title: "Yay!",
          message: `Submitted ${values.hours} hours on ${formatShortDate(values.spent_date)}`,
        });
        const spentDate = DateTime.fromISO(result.spent_date);
        push(
          <HarvestWeek
            selectedDate={result.spent_date}
            selectedWeek={{ weekNumber: spentDate.weekNumber, weekYear: spentDate.weekYear }}
          />
        );
      } catch (err) {
        showToast({
          style: Toast.Style.Failure,
          title: "Oh snap!",
          message: `Something went wrong sending the data to Harvest`,
        });
      }
    },
  });

  useEffect(() => {
    const result = harvestPostTimeEntry.safeParse({ project_id: projectId, task_id: taskId, ...values });
    if (!result.success) {
      const errors = result.error.flatten((issue: ZodIssue) => ({
        message: issue.message,
        errorCode: issue.code,
      }));

      for (const [fieldKey, fieldErrors] of Object.entries(errors.fieldErrors)) {
        setValidationError(fieldKey as "hours" | "spent_date", fieldErrors.map((e) => e.message).join());
      }
    }
  }, [values]);

  useEffect(() => {
    if (skipToSubmit) {
      handleSubmit(values);
    }
  }, []);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit Answer" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description title="Project ID" text={projectId.toString()} />
      <Form.Description title="Task ID" text={taskId.toString()} />
      <Form.DatePicker title="Date" type={Form.DatePicker.Type.Date} {...itemProps.spent_date} />
      <Form.TextField title="Hours" {...itemProps.hours} />
      <Form.TextArea title="Notes" {...itemProps.notes} />
    </Form>
  );
}
