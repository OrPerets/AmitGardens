import { z } from 'zod';

const planRegex = /^(\d{4})-(0[1-9]|1[0-2])$/;
const planCompactRegex = /^(\d{4})(0[1-9]|1[0-2])$/;

export const PlanQuerySchema = z.object({
  plan: z.string().regex(planRegex),
  g: z.string(),
  t: z.string(),
});

export const PlanQueryCompactSchema = z.object({
  plan: z.string().regex(planCompactRegex),
  g: z.string(),
  t: z.string(),
});

export const PlanParamSchema = z.object({
  plan: z.string().regex(planRegex),
});

export const CreateSingleLinkSchema = z.object({
  plan: z.string().regex(planRegex),
  gardenerName: z.string().min(1),
  deadline: z.string().datetime().optional(),
});

export const AssignmentRowSchema = z.object({
  date: z.string().datetime(),
  address: z.string().min(1),
  notes: z.string().optional(),
});

export const BulkUpsertSchema = z.object({
  plan: z.string().regex(planRegex),
  g: z.string(),
  t: z.string(),
  rows: z.array(AssignmentRowSchema),
});

export const SubmitSchema = z.object({
  plan: z.string().regex(planRegex),
  g: z.string(),
  t: z.string(),
});

export const AdminAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

