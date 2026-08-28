import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createPaymentLink } from "./services/razorpay.service.js";
import webhookRoutes from "./routes/webhook.routes.js";
import growthRoutes from "./routes/growth.routes.js";


dotenv.config();



const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

app.use("/api/growth", growthRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "GrowthPilot API is running",
  });
});



app.post("/api/test/payment-link", async (_req, res) => {
  try {
    const paymentLink = await createPaymentLink({
      amount: 99900,
      description: "GrowthPilot Premium Upgrade",
      referenceId: `growth_${Date.now()}`,
    });

    res.status(201).json({
      success: true,
      paymentLink,
    });
  } catch (error) {
    console.error("Payment Link error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create payment link",
    });
  }
});

app.use("/api/webhooks", webhookRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`GrowthPilot API running on http://localhost:${PORT}`);
});