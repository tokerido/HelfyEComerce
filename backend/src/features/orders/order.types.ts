import { z } from 'zod';

export const ShippingAddressSchema = z.object({
  firstName:    z.string().trim().min(1),
  lastName:     z.string().trim().min(1),
  addressLine1: z.string().trim().min(1),
  addressLine2: z.string().trim().optional(),
  city:         z.string().trim().min(1),
  state:        z.string().trim().min(1),
  zipCode:      z.string().trim().min(1),
  country:      z.string().trim().min(1),
  phone:        z.string().trim().optional(),
});

export const CreateOrderSchema = z.object({
  shippingAddress: ShippingAddressSchema,
});

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

export interface OrderSummary {
  id:          number;
  orderNumber: string;
  status:      string;
  total:       string;
  itemCount:   number;
  createdAt:   string;
}

export interface OrderDetail {
  id:              number;
  orderNumber:     string;
  status:          string;
  items:           OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal:        string;
  shippingCost:    string;
  tax:             string;
  total:           string;
  createdAt:       string;
}

export interface OrderItem {
  id:              number;
  productId:       number | null;
  productName:     string;
  productImageUrl: string;
  quantity:        number;
  unitPrice:       string;
  lineTotal:       string;
}
