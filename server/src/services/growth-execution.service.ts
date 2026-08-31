import { GrowthAction } from "../types/action.js";
import { createPaymentLink } from "./razorpay.service.js";

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

    paymentLink?: {
    id: string;
    shortUrl: string;
    status: string;
  };

  details?: {
    status: string;
    executedAt: string;
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

  const executedAt = new Date().toISOString();

  switch (action.actionType) {
    case "CROSS_SELL": {
      if (!action.targetProduct || !action.suggestedProduct) {
        throw new Error(
          "Cross-sell action requires target and suggested products"
        );
      }

      // Create a real Razorpay payment link in test mode
      const paymentLink = await createPaymentLink({
        amount: 10000, // ₹100 in paise - test/demo amount
        description: `Cross-sell: ${action.suggestedProduct}`,
        referenceId: action.id,
        
      });

      console.log("RAZORPAY PAYMENT LINK:", paymentLink);

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

        paymentLink: {
  id: paymentLink.id,
  shortUrl: paymentLink.short_url,
  status: paymentLink.status,
},

        details: {
          status: "ACTIVATED",
          executedAt,
        },
      };
    }

    case "UPSELL": {
      if (!action.targetProduct) {
        throw new Error(
          "Upsell action requires a target product"
        );
      }

      return {
        success: true,
        actionId: action.id,
        executionType: "UPSELL_RECOMMENDATION",

        message: `Upsell recommendation activated for ${action.targetProduct}`,

        details: {
          status: "ACTIVATED",
          executedAt,
        },
      };
    }

    case "CAMPAIGN": {
      return {
        success: true,
        actionId: action.id,
        executionType: "CAMPAIGN",

        message: "Growth campaign activated",

        details: {
          status: "ACTIVATED",
          executedAt,
        },
      };
    }

    case "RETENTION": {
      return {
        success: true,
        actionId: action.id,
        executionType: "RETENTION_CAMPAIGN",

        message: "Retention campaign activated",

        details: {
          status: "ACTIVATED",
          executedAt,
        },
      };
    }

    default:
      throw new Error(
        `Unsupported action type: ${action.actionType}`
      );
  }
}