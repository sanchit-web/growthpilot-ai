import {
  GrowthOpportunity,
  GrowthOpportunitySchema,
} from "../types/growth.js";

import { MerchantData } from "../types/merchant.js";

export async function generateGrowthOpportunity(
  merchant: MerchantData
): Promise<GrowthOpportunity> {
  const products = [...merchant.products].sort(
    (a, b) => b.sales - a.sales
  );

  const bestSeller = products[0];

  const secondBestSeller = products[1];

  if (!bestSeller) {
    throw new Error("Merchant has no products");
  }

  const opportunity: GrowthOpportunity = {
    title: `Increase value from ${bestSeller.name} buyers`,

    problem:
      "The merchant is generating sales from a strong product but may be missing opportunities to increase the value of each order.",

    recommendation: secondBestSeller
      ? `Create a cross-sell campaign pairing ${bestSeller.name} with ${secondBestSeller.name}.`
      : `Create an upsell campaign around ${bestSeller.name}.`,

    actionType: secondBestSeller
      ? "CROSS_SELL"
      : "UPSELL",

    targetProduct: bestSeller.name,

    suggestedProduct: secondBestSeller?.name,

    reasoning:
      "The recommendation is based on product sales concentration and the opportunity to increase average order value.",

    expectedImpact:
      "Potential increase in average order value through targeted cross-selling.",

    confidence: 0.72,
  };

  return GrowthOpportunitySchema.parse(opportunity);
}