import {
  GrowthOpportunity,
  GrowthOpportunitySchema,
} from "../types/growth.js";

import { MerchantData } from "../types/merchant.js";
import { gemini } from "../config/gemini.js";

export async function generateGrowthOpportunity(
  merchant: MerchantData
): Promise<GrowthOpportunity> {
  if (!merchant.products.length) {
    throw new Error("Merchant has no products");
  }

  // Calculate factual metrics in our application.
  // Gemini must not invent these values.
  const products = merchant.products;

  const totalSales = products.reduce(
    (sum, product) => sum + product.sales,
    0
  );

  const totalRevenue = products.reduce(
    (sum, product) => sum + product.price * product.sales,
    0
  );

  const averageProductRevenue =
    totalSales > 0 ? totalRevenue / totalSales : 0;

  const sortedProducts = [...products].sort(
    (a, b) => b.sales - a.sales
  );

  const topProduct = sortedProducts[0];

  if (!topProduct) {
    throw new Error("Merchant has no products");
  }

  const otherProducts = sortedProducts.filter(
    (product) => product.name !== topProduct.name
  );

  const prompt = `
You are GrowthPilot, an AI merchant-growth analyst.

Analyze the merchant data below and identify ONE realistic opportunity
to increase revenue.

Allowed action types:
- CROSS_SELL
- UPSELL
- CAMPAIGN

STRICT GROUNDING RULES:

1. Use ONLY the facts provided below.
2. NEVER invent sales numbers.
3. NEVER invent revenue numbers.
4. NEVER invent average order value.
5. NEVER claim that customers "frequently" buy something unless the
   supplied data proves it.
6. Do not invent customer behavior.
7. Do not invent conversion rates.
8. Do not invent percentages.
9. You may make a reasonable business inference, but clearly describe
   it as a potential opportunity, not a guaranteed result.
10. Confidence must be between 0 and 1.
11. If the action does not require a suggested product, return
    suggestedProduct as null.
12. Return ONLY JSON matching the requested structure.

FACTUAL MERCHANT DATA:

Merchant:
${JSON.stringify(merchant, null, 2)}

CALCULATED FACTS:

Total units sold:
${totalSales}

Total product revenue:
${totalRevenue}

Average revenue per unit:
${averageProductRevenue.toFixed(2)}

Top-selling product:
${JSON.stringify(topProduct, null, 2)}

Other products:
${JSON.stringify(otherProducts, null, 2)}

IMPORTANT:
The calculated facts above come from the application.
Do not modify or replace their values.

Return one opportunity with:
- title
- problem
- recommendation
- actionType
- targetProduct
- suggestedProduct
- reasoning
- expectedImpact
- confidence
`;

  const response = await gemini.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          title: {
            type: "string",
          },
          problem: {
            type: "string",
          },
          recommendation: {
            type: "string",
          },
          actionType: {
            type: "string",
            enum: ["CROSS_SELL", "UPSELL", "CAMPAIGN"],
          },
          targetProduct: {
            type: "string",
          },
          suggestedProduct: {
            type: "string",
            nullable: true,
          },
          reasoning: {
            type: "string",
          },
          expectedImpact: {
            type: "string",
          },
          confidence: {
            type: "number",
          },
        },
        required: [
          "title",
          "problem",
          "recommendation",
          "actionType",
          "targetProduct",
          "reasoning",
          "expectedImpact",
          "confidence",
        ],
      },
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response");
  }

  const parsed = JSON.parse(response.text);

  return GrowthOpportunitySchema.parse(parsed);
}