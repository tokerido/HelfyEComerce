import { z } from 'zod';

export const AddItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity:  z.number().int().positive().max(99),
});

export const UpdateItemSchema = z.object({
  quantity: z.number().int().positive().max(99),
});

export const SyncCartSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity:  z.number().int().positive().max(99),
  })),
});

export interface CartItem {
  id:         number;
  product:    { id: number; name: string; slug: string; imageUrl: string };
  quantity:   number;
  priceAtAdd: string;
  lineTotal:  string;
}

export interface Cart {
  id:           number;
  items:        CartItem[];
  subtotal:     string;
  shippingCost: string;
  tax:          string;
  total:        string;
}
