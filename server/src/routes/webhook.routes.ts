import { Router } from "express";
import { verifyWebhookSignature } from "../utils/verifyWebhook.js";

const router = Router();

router.post("/razorpay", (req, res) => {
  const signature = req.headers[
    "x-razorpay-signature"
  ] as string;

  const isValid = verifyWebhookSignature(
    JSON.stringify(req.body),
    signature
  );

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid webhook signature",
    });
  }

  console.log("Verified Razorpay webhook:");
  console.log(req.body);

  return res.status(200).json({
    success: true,
    message: "Webhook verified",
  });
});

export default router;