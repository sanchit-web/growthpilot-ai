import { GrowthAction } from "../types/action.js";

export type GrowthExecutionResult = {
  success: boolean;
  actionId: string;
  executionType: string;
  message: string;

  recommendation?: {
    targetProduct: string;
    suggestedProduct: string;
    placement: string;
  };
};

export async function executeGrowthAction(
  action: GrowthAction
): Promise<GrowthExecutionResult> {
  if (action.status !== "APPROVED") {
    throw new Error(
      `Action cannot be executed from status: ${action.status}`
    );
  }

  switch (action.actionType) {
    case "CROSS_SELL": {
      if (!action.targetProduct || !action.suggestedProduct) {
        throw new Error(
          "Cross-sell action requires target and suggested products"
        );
      }

      return {
        success: true,
        actionId: action.id,
        executionType: "PRODUCT_RECOMMENDATION",
        message: `Cross-sell recommendation activated: ${action.suggestedProduct}`,
        recommendation: {
          targetProduct: action.targetProduct,
          suggestedProduct: action.suggestedProduct,
          placement: "PRODUCT_PAGE",
        },
      };
    }

    case "UPSELL":
      return {
        success: true,
        actionId: action.id,
        executionType: "UPSELL_RECOMMENDATION",
        message: `Upsell recommendation activated for ${action.targetProduct}`,
      };

    case "CAMPAIGN":
      return {
        success: true,
        actionId: action.id,
        executionType: "CAMPAIGN",
        message: "Growth campaign activated",
      };

    case "RETENTION":
      return {
        success: true,
        actionId: action.id,
        executionType: "RETENTION_CAMPAIGN",
        message: "Retention campaign activated",
      };

    default:
      throw new Error(
        `Unsupported action type: ${action.actionType}`
      );
  }
}