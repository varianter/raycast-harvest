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
  hourly_rate: z.null(),
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

export const harvestProjectAssignments = z.object({
  project_assignments: z.array(harvestProjectAssignment),
});

export const harvestTimeEntry = z.object({
  project_id: z.number().positive(),
  task_id: z.number().positive(),
  spent_date: z.coerce.date(),
  hours: z.number().positive(),
});

export type HarvestTimeEntry = z.infer<typeof harvestTimeEntry>;
