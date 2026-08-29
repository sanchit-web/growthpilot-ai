import { prisma } from "../config/prisma.js";
import {
  GrowthAction,
  GrowthActionSchema,
} from "../types/action.js";
import { GrowthOpportunity } from "../types/growth.js";

export async function createGrowthAction(
  opportunity: GrowthOpportunity
): Promise<GrowthAction> {
  const action: GrowthAction = {
    id: `action_${Date.now()}`,
    actionType: opportunity.actionType,
    title: opportunity.title,
    description: opportunity.recommendation,
    targetProduct: opportunity.targetProduct,
    suggestedProduct: opportunity.suggestedProduct ?? null,
    status: "PROPOSED",
    requiresApproval: true,
  };

  const validatedAction = GrowthActionSchema.parse(action);

  await prisma.growthAction.create({
    data: validatedAction,
  });

  return validatedAction;
}