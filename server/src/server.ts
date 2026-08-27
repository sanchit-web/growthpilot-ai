import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "GrowthPilot API is running",
  });
});

app.post("/api/test/order", async (_req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 99900,
      currency: "INR",
      receipt: `test_${Date.now()}`,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay test order",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`GrowthPilot API running on http://localhost:${PORT}`);
});