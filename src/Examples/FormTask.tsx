import { Action, ActionPanel, Form, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { z } from "zod";

const numberInString = z.string().transform((val, ctx) => {
  const parsed = parseFloat(val);
  console.log(parsed);
  if (isNaN(parsed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Not a number",
    });
    return z.NEVER;
  }
  return parsed;
});

export const harvestTimeEntry = z.object({
  project_id: z.number().positive(),
  task_id: z.number().positive(),
  spent_date: z.date().transform((d: Date) => d.toISOString().slice(0, 10)),
  hours: numberInString,
});

const formEntriesOnly = harvestTimeEntry.pick({ hours: true, spent_date: true });
type ValidationKeys = keyof z.infer<typeof formEntriesOnly>;

type FormValues = {
  hours: string;
  spent_date: Date;
};

const initialErrors: Record<ValidationKeys, string> = { spent_date: "", hours: "" };

export default function Command({ projectId, taskId }: { projectId: number; taskId: number }) {
  const [errors, setErrors] = useState<Partial<typeof initialErrors>>(initialErrors);
  function handleSubmit(formValues: FormValues) {
    const submitValues = {
      project_id: projectId,
      task_id: taskId,
      ...formValues,
    };
    const parse = formEntriesOnly.safeParse(submitValues);

    if (!parse.success) {
      showToast({
        style: Toast.Style.Failure,
        title: "Nooo!",
        message: `Error: ${parse.error.errors.map((e) => e.message).join()}`,
      });
    } else {
      showToast({
        style: Toast.Style.Success,
        title: "Yay!",
        message: `Du la til ${formValues.hours} timmar`,
      });
    }
  }

  function handleOnChange(value: string | Date | null, schemaKey: ValidationKeys) {
    const parse = formEntriesOnly.safeParse({ [schemaKey]: value });
    if (!parse.success) {
      setErrors({ ...errors, [schemaKey]: parse.error.errors.map((e) => e.message).join() });
    } else {
      setErrors({ ...errors, [schemaKey]: "" });
    }
  }
  console.log(errors);
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit Answer" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description title="Prosjekt" text={projectId.toString()} />
      <Form.Description title="Prosjekt" text={taskId.toString()} />
      <Form.DatePicker
        id="spent_date"
        title="Dato"
        error={errors.spent_date}
        type={Form.DatePicker.Type.Date}
        defaultValue={new Date()}
        onChange={(value) => handleOnChange(value, "spent_date")}
      />
      <Form.TextField
        id="hours"
        title="Antal timer"
        defaultValue="7.5"
        error={errors.hours}
        onChange={(value) => handleOnChange(value, "hours")}
      />
    </Form>
  );
}
