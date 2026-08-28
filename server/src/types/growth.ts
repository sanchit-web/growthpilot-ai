import { z } from "zod";

export const GrowthOpportunitySchema = z.object({
  title: z.string(),
  problem: z.string(),
  recommendation: z.string(),
  actionType: z.enum([
    "UPSELL",
    "CROSS_SELL",
    "CAMPAIGN",
    "RETENTION",
  ]),
  targetProduct: z.string().optional(),
  suggestedProduct: z.string().optional(),
  reasoning: z.string(),
  expectedImpact: z.string(),
  confidence: z.number().min(0).max(1),
});

export type GrowthOpportunity = z.infer<
  typeof GrowthOpportunitySchema
>;