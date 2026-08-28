import { Router } from "express";
import { MerchantDataSchema } from "../types/merchant.js";
import { generateGrowthOpportunity } from "../services/growth-ai.service.js";
import { createGrowthAction } from "../services/growth-agent.service.js";
import {
  approveGrowthAction,
  rejectGrowthAction,
} from "../services/action-approval.service.js";
import { GrowthAction } from "../types/action.js";

const router = Router();

// Temporary in-memory action store.
// We will replace this with PostgreSQL later.
const actions = new Map<string, GrowthAction>();

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

    const action = createGrowthAction(opportunity);

    actions.set(action.id, action);

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

router.post("/action/:id/approve", (req, res) => {
  try {
    const action = actions.get(req.params.id);

    if (!action) {
      return res.status(404).json({
        success: false,
        message: "Growth action not found",
      });
    }

    const approvedAction = approveGrowthAction(action);

    actions.set(approvedAction.id, approvedAction);

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

router.post("/action/:id/reject", (req, res) => {
  try {
    const action = actions.get(req.params.id);

    if (!action) {
      return res.status(404).json({
        success: false,
        message: "Growth action not found",
      });
    }

    const rejectedAction = rejectGrowthAction(action);

    actions.set(rejectedAction.id, rejectedAction);

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

export default router;