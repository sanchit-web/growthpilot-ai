import { Router } from "express";
import { MerchantDataSchema } from "../types/merchant.js";
import { generateGrowthOpportunity } from "../services/growth-ai.service.js";

const router = Router();

router.post("/analyze", async (req, res) => {
  try {
    const merchant = MerchantDataSchema.parse(req.body);

    const opportunity =
      await generateGrowthOpportunity(merchant);

    return res.status(200).json({
      success: true,
      opportunity,
    });
  } catch (error) {
    console.error("Growth analysis error:", error);

    return res.status(400).json({
      success: false,
      message: "Unable to analyze merchant data",
    });
  }
});

export default router;