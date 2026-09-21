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
    const rawBodyString = rawBody.toString("utf8");

    const isValid = verifyWebhookSignature(
      rawBodyString,
      signature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const payload = JSON.parse(rawBodyString);

    console.log("Verified Razorpay webhook:");
    console.log(payload);

    /*
     * --------------------------------------------------
     * PAYMENT LINK PAID
     * --------------------------------------------------
     */

    if (payload.event === "payment_link.paid") {
      const paymentLink =
  payload.payload?.payment_link?.entity;

const paymentLinkId = paymentLink?.id;

const growthActionId =
  paymentLink?.reference_id;

const paymentEntity =
  payload.payload?.payment?.entity;

      if (!paymentLinkId) {
        console.error("Payment Link ID missing");

        return res.status(400).json({
          success: false,
          message: "Payment Link ID missing",
        });
      }

      if (!growthActionId) {
  console.error("GrowthAction ID missing from Payment Link reference_id");

  return res.status(400).json({
    success: false,
    message: "GrowthAction ID missing",
  });
}

      if (!paymentEntity?.id) {
        console.error("Razorpay Payment ID missing");

        return res.status(400).json({
          success: false,
          message: "Razorpay Payment ID missing",
        });
      }

      const growthAction = await prisma.growthAction.findUnique({
  where: {
    id: growthActionId,
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

      /*
       * --------------------------------------------------
       * IDEMPOTENCY CHECK
       * --------------------------------------------------
       *
       * Razorpay may deliver the same webhook more than once.
       * We don't want duplicate Payment records.
       */

      const existingPayment =
        await prisma.payment.findUnique({
          where: {
            razorpayPaymentId: paymentEntity.id,
          },
        });

      if (existingPayment) {
        console.log(
          `Payment ${paymentEntity.id} already exists. Skipping duplicate webhook.`
        );

        return res.status(200).json({
          success: true,
          message: "Payment already processed",
        });
      }

      /*
       * --------------------------------------------------
       * CREATE PAYMENT RECORD
       * --------------------------------------------------
       */

      const payment = await prisma.payment.create({
        data: {
          growthActionId: growthAction.id,

          razorpayPaymentId: paymentEntity.id,

          razorpayOrderId:
            paymentEntity.order_id ?? null,

          razorpayPaymentLinkId: paymentLinkId,

          amount: paymentEntity.amount,

          currency: paymentEntity.currency,

          status: "SUCCESS",

          paidAt: new Date(),
        },
      });


      

      console.log(
        `Payment ${payment.id} created for GrowthAction ${growthAction.id}`
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