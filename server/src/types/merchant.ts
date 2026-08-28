import { z } from "zod";

export const MerchantDataSchema = z.object({
  businessName: z.string().min(1),
  category: z.string().min(1),

  products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number().positive(),
      sales: z.number().nonnegative(),
    })
  ),

  monthlyOrders: z.number().nonnegative(),
  averageOrderValue: z.number().nonnegative(),
});

export type MerchantData = z.infer<typeof MerchantDataSchema>;