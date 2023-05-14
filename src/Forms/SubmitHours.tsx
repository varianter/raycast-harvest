import { Action, ActionPanel, Form, showToast, Toast } from "@raycast/api";
import { useForm } from "@raycast/utils";
import { useEffect } from "react";
import { ZodIssue } from "zod";
import { postHarvestTime } from "../api";
import { harvestPostTimeEntry } from "../Schemas/Harvest";

type FormValues = {
  hours: string;
  notes: string;
  spent_date: Date | null;
};

export default function Command({
  projectId,
  taskId,
  hours = "7.5",
}: {
  projectId: number;
  taskId: number;
  hours?: string;
}) {
  const { handleSubmit, itemProps, setValidationError, values } = useForm<FormValues>({
    initialValues: {
      spent_date: new Date(),
      hours: hours,
    },
    async onSubmit(values) {
      try {
        const result = harvestPostTimeEntry.parse({ project_id: projectId, task_id: taskId, ...values });
        await postHarvestTime(result);

        showToast({
          style: Toast.Style.Success,
          title: "Yay!",
          message: `Submitted ${values.hours} hours at ${values.spent_date}`,
        });
      } catch (err) {
        showToast({
          style: Toast.Style.Failure,
          title: "Oh snap!",
          message: `Something went wrong sending the data to Harvet`,
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
