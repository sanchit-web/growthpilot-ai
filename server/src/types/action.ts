import { z } from "zod";

export const GrowthActionSchema = z.object({
  id: z.string(),

  actionType: z.enum([
    "CROSS_SELL",
    "UPSELL",
    "CAMPAIGN",
    "RETENTION",
  ]),

  title: z.string(),

  description: z.string(),

  targetProduct: z.string().optional(),

  suggestedProduct: z.string().nullable().optional(),

  status: z.enum([
    "PROPOSED",
    "APPROVED",
    "EXECUTED",
    "REJECTED",
  ]),

  requiresApproval: z.boolean(),
});

export type GrowthAction = z.infer<typeof GrowthActionSchema>;