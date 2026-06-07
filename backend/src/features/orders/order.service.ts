import { AppError } from '../../shared/errors/AppError';
import { ErrorCodes } from '../../constants/errorCodes';
import { orderRepository } from './order.repository';
import { cartRepository } from '../cart/cart.repository';
import type { ShippingAddress } from './order.types';

export const orderService = {
  async createOrder(userId: number, shippingAddress: ShippingAddress) {
    const cart = await cartRepository.getCartWithItems(userId);
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', ErrorCodes.VALIDATION_ERROR, 400);
    }

    const items = cart.items.map(i => ({
      productId:       i.product.id,
      productName:     i.product.name,
      productImageUrl: i.product.imageUrl,
      quantity:        i.quantity,
      unitPrice:       i.priceAtAdd,
      lineTotal:       i.lineTotal,
    }));

    const { orderId, orderNumber } = await orderRepository.create(
      userId,
      cart.subtotal,
      cart.shippingCost,
      cart.tax,
      cart.total,
      shippingAddress,
      items
    );

    await cartRepository.clearCart(cart.id);

    return { orderId, orderNumber, status: 'pending', total: cart.total };
  },

  async getOrders(userId: number, page: number, limit: number) {
    const { orders, total } = await orderRepository.findByUserId(userId, page, limit);
    return { orders, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getOrderById(orderId: number, userId: number) {
    const order = await orderRepository.findByIdForUser(orderId, userId);
    if (!order) throw new AppError('Order not found', ErrorCodes.ORDER_NOT_FOUND, 404);
    return order;
  },
};
