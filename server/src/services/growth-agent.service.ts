import {
  GrowthAction,
  GrowthActionSchema,
} from "../types/action.js";

import { GrowthOpportunity } from "../types/growth.js";

export function createGrowthAction(
  opportunity: GrowthOpportunity
): GrowthAction {
  const action: GrowthAction = {
    actionType: opportunity.actionType,

    title: opportunity.title,

    description: opportunity.recommendation,

    targetProduct: opportunity.targetProduct,

    suggestedProduct: opportunity.suggestedProduct ?? null,

    status: "PROPOSED",

    requiresApproval: true,
  };

  return GrowthActionSchema.parse(action);
}