import { z } from "zod";

const harvestTaskSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const taskAssignmentSchema = z.object({
  id: z.number(),
  billable: z.boolean(),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  hourly_rate: z.number().nullable(),
  budget: z.null(),
  task: harvestTaskSchema,
});
export type TaskAssignment = z.infer<typeof taskAssignmentSchema>;

const harvestProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  is_billable: z.boolean(),
});

const harvestClientSchema = z.object({
  id: z.number(),
  name: z.string(),
  currency: z.string(),
});

const harvestProjectAssignment = z.object({
  id: z.number(),
  is_project_manager: z.boolean(),
  is_active: z.boolean(),
  use_default_rates: z.boolean(),
  budget: z.null(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  hourly_rate: z.number().nullable(),
  project: harvestProjectSchema,
  client: harvestClientSchema,
  task_assignments: z.array(taskAssignmentSchema),
});
export type HarvestProjectAssignment = z.infer<typeof harvestProjectAssignment>;

export const harvestProjectAssignments = z.object({
  project_assignments: z.array(harvestProjectAssignment),
});

const project = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
});

const client = z.object({ id: z.number().positive(), name: z.string() });
const task = z.object({ id: z.number().positive(), name: z.string() });

// non-exhaustive
export const harvestTimeEntry = z.object({
  id: z.number(),
  client: client,
  project: project,
  task: task,
  spent_date: z.string(),
  hours: z.number().positive(),
});
const stringToNumber = z
  .string()
  .regex(/^(?!^[.,])[0-9.,]+$/, { message: "String has invalid format" })
  .transform((val) => parseFloat(val.replace(",", ".")));

export const harvestPostTimeEntry = z.object({
  user_id: z.number().positive().optional(),
  project_id: z.number().positive(),
  task_id: z.number().positive(),
  spent_date: z.date().transform((d: Date) => d.toISOString().slice(0, 10)),
  hours: stringToNumber,
  notes: z.string().optional(),
});
export type HarvestPostTimeEntry = z.infer<typeof harvestPostTimeEntry>;

export const harvestTimeEntries = z.object({
  time_entries: z.array(harvestTimeEntry),
});

export type HarvestTimeEntry = z.infer<typeof harvestTimeEntry>;
export type HarvestTimeEntries = z.infer<typeof harvestTimeEntries>;

export const userId = z.object({
  id: z.number(),
});
