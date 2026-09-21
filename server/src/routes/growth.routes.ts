import { Router } from "express";
import { MerchantDataSchema } from "../types/merchant.js";
import { generateGrowthOpportunity } from "../services/growth-ai.service.js";
import { createGrowthAction } from "../services/growth-agent.service.js";
import { prisma } from "../config/prisma.js";
import { executeGrowthAction } from "../services/growth-execution.service.js";


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

router.post("/action", async (req, res) => {
  try {
    const merchant = MerchantDataSchema.parse(req.body);

    const opportunity =
      await generateGrowthOpportunity(merchant);

     const action = await createGrowthAction(opportunity);

    return res.status(200).json({
      success: true,
      opportunity,
      action,
    });
  } catch (error) {
    console.error("Growth agent error:", error);

    return res.status(400).json({
      success: false,
      message: "Unable to create growth action",
    });
  }
});

router.get("/actions", async (_req, res) => {
  try {
const actions = await prisma.growthAction.findMany({
  include: {
    payments: true,
  },
  orderBy: {
    createdAt: "desc",
  },
});

    return res.status(200).json({
      success: true,
      actions,
    });
  } catch (error) {
    console.error("Growth actions fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch growth actions",
    });
  }
});

router.post("/action/:id/approve", async (req, res) => {
  try {
    const action = await prisma.growthAction.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!action) {
      return res.status(404).json({
        success: false,
        message: "Growth action not found",
      });
    }

    const approvedAction = await prisma.growthAction.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: "APPROVED",
      },
    });

    return res.status(200).json({
      success: true,
      action: approvedAction,
    });
  } catch (error) {
    console.error("Action approval error:", error);

    return res.status(400).json({
      success: false,
      message: "Unable to approve growth action",
    });
  }
});

router.post("/action/:id/reject", async (req, res) => {
  try {
    const action = await prisma.growthAction.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!action) {
      return res.status(404).json({
        success: false,
        message: "Growth action not found",
      });
    }

    const rejectedAction = await prisma.growthAction.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: "REJECTED",
      },
    });

    return res.status(200).json({
      success: true,
      action: rejectedAction,
    });
  } catch (error) {
    console.error("Action rejection error:", error);

    return res.status(400).json({
      success: false,
      message: "Unable to reject growth action",
    });
  }
});

router.post("/action/:id/execute", async (req, res) => {
  try {
    const action = await prisma.growthAction.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!action) {
      return res.status(404).json({
        success: false,
        message: "Growth action not found",
      });
    }

    if (action.status !== "APPROVED") {
      return res.status(400).json({
        success: false,
        message: `Action cannot be executed from status: ${action.status}`,
      });
    }

    const result = await executeGrowthAction({
      ...action,
      targetProduct: action.targetProduct ?? undefined,
      suggestedProduct: action.suggestedProduct ?? null,
      status: action.status as
        | "PROPOSED"
        | "APPROVED"
        | "EXECUTED"
        | "REJECTED",
      actionType: action.actionType as
        | "CROSS_SELL"
        | "UPSELL"
        | "CAMPAIGN"
        | "RETENTION",
    });

    const executedAction = await prisma.growthAction.update({
  where: {
    id: req.params.id,
  },
  data: {
    status: "EXECUTED",
    executionResult: result,
  },
});

    return res.status(200).json({
      success: true,
      result,
      action: executedAction,
    });
  } catch (error) {
    console.error("Growth action execution error:", error);

    return res.status(400).json({
      success: false,
      message: "Unable to execute growth action",
    });
  }
});

router.get("/recommendations", async (_req, res) => {
  try {
    const recommendations = await prisma.growthAction.findMany({
  where: {
    status: "EXECUTED",
  },
  include: {
    payments: true,
  },
  orderBy: {
    updatedAt: "desc",
  },
});

    return res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error("Recommendation fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch recommendations",
    });
  }
});

export default router;