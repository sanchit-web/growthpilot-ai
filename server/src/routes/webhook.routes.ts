import { Router } from "express";
import { verifyWebhookSignature } from "../utils/verifyWebhook.js";
import { prisma } from "../config/prisma.js";

const router = Router();

router.post("/razorpay", async (req, res) => {
  try {
    const signature = req.headers[
      "x-razorpay-signature"
    ] as string;

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: "Missing webhook signature",
      });
    }

    const rawBody = req.body as Buffer;

    const isValid = verifyWebhookSignature(
      rawBody.toString("utf8"),
      signature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const payload = JSON.parse(rawBody.toString("utf8"));

    console.log("Verified Razorpay webhook:");
    console.log(payload);

    if (payload.event === "payment_link.paid") {
      const paymentLinkId =
        payload.payload?.payment_link?.entity?.id;

      if (!paymentLinkId) {
        console.error("Payment Link ID missing");

        return res.status(400).json({
          success: false,
          message: "Payment Link ID missing",
        });
      }

      const growthAction = await prisma.growthAction.findFirst({
        where: {
          paymentLinkId,
        },
      });

      if (!growthAction) {
        console.error(
          "Growth action not found for payment link:",
          paymentLinkId
        );

        return res.status(404).json({
          success: false,
          message: "Growth action not found",
        });
      }

      await prisma.growthAction.update({
        where: {
          id: growthAction.id,
        },
        data: {
          paymentStatus: "paid",
        },
      });

      console.log(
        `Payment marked as paid for GrowthAction ${growthAction.id}`
      );
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    console.error("Webhook processing error:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
});

export default router;