import { Action, ActionPanel, Form, showToast, Toast } from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import { useState, Validator } from "react";
import { z } from "zod";

const numberInString = z.string().transform((val, ctx) => {
  const parsed = parseFloat(val);

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

type FormValues = {
  hours: string;
  spent_date: Date | null;
};

function validateHours(str: string | undefined) {
  const regex = /^\d+(\.\d+)?$/;
  if (typeof str !== "string") {
    return "String must be a...string";
  }
  if (regex.test(str)) {
    return;
  } else {
    return "String contains non-numeric characters or more than one period.";
  }
}

export default function Command({
  projectId,
  taskId,
  hours = "7.5",
}: {
  projectId: number;
  taskId: number;
  hours?: string;
}) {
  const { handleSubmit, itemProps } = useForm<FormValues>({
    initialValues: {
      spent_date: new Date(),
      hours: hours,
    },
    onSubmit(values) {
      showToast({
        style: Toast.Style.Success,
        title: "Yay!",
        message: `Submitted ${values.hours} hours at ${values.spent_date}`,
      });
    },
    validation: {
      spent_date: FormValidation.Required,
      hours: (value) => validateHours(value),
    },
  });

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
      <Form.DatePicker title="Dato" type={Form.DatePicker.Type.Date} {...itemProps.spent_date} />
      <Form.TextField title="Antal timer" defaultValue={hours} {...itemProps.hours} />
    </Form>
  );
}
