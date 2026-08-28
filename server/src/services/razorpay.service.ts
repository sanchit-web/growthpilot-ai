import razorpay from "../config/razorpay.js";

export interface CreatePaymentLinkInput {
  amount: number;
  description: string;
  referenceId: string;
}

export async function createPaymentLink(
  input: CreatePaymentLinkInput
) {
  const paymentLink = await razorpay.paymentLink.create({
    amount: input.amount,
    currency: "INR",
    description: input.description,
    reference_id: input.referenceId,
    customer: {
      name: "Test Customer",
      email: "test@example.com",
      contact: "9876543210",
    },
    options: {
      checkout: {
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true,
        },
      },
    },
  });

  return paymentLink;
}