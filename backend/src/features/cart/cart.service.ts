import { AppError } from '../../shared/errors/AppError';
import { ErrorCodes } from '../../constants/errorCodes';
import { cartRepository } from './cart.repository';
import { productRepository } from '../products/product.repository';

export const cartService = {
  async getCart(userId: number) {
    const cart = await cartRepository.getCartWithItems(userId);
    if (!cart) {
      const { id } = await cartRepository.getOrCreateCart(userId);
      return { id, items: [], subtotal: '0.00', shippingCost: '9.99', tax: '0.00', total: '9.99' };
    }
    return cart;
  },

  async addItem(userId: number, productId: number, quantity: number) {
    const product = await productRepository.findById(productId);
    if (!product) throw new AppError('Product not found', ErrorCodes.PRODUCT_NOT_FOUND, 404);

    const { id: cartId } = await cartRepository.getOrCreateCart(userId);
    const existing = await cartRepository.findItem(cartId, productId);
    const newQty = (existing?.quantity ?? 0) + quantity;

    if (newQty > product.stockQuantity) {
      throw new AppError('Insufficient stock', ErrorCodes.INSUFFICIENT_STOCK, 400);
    }

    if (existing) {
      await cartRepository.updateItemQuantity(existing.id, newQty);
    } else {
      await cartRepository.addItem(cartId, productId, quantity, product.price);
    }

    return cartService.getCart(userId);
  },

  async updateItem(userId: number, itemId: number, quantity: number) {
    const item = await cartRepository.findItemById(itemId, userId);
    if (!item) throw new AppError('Cart item not found', ErrorCodes.CART_ITEM_NOT_FOUND, 404);
    await cartRepository.updateItemQuantity(itemId, quantity);
    return cartService.getCart(userId);
  },

  async removeItem(userId: number, itemId: number) {
    const item = await cartRepository.findItemById(itemId, userId);
    if (!item) throw new AppError('Cart item not found', ErrorCodes.CART_ITEM_NOT_FOUND, 404);
    await cartRepository.removeItem(itemId);
    return cartService.getCart(userId);
  },

  async syncCart(userId: number, items: { productId: number; quantity: number }[]) {
    const { id: cartId } = await cartRepository.getOrCreateCart(userId);
    for (const item of items) {
      const product = await productRepository.findById(item.productId);
      if (!product) continue;
      const existing = await cartRepository.findItem(cartId, item.productId);
      const newQty = Math.min((existing?.quantity ?? 0) + item.quantity, product.stockQuantity);
      if (existing) {
        await cartRepository.updateItemQuantity(existing.id, newQty);
      } else {
        await cartRepository.addItem(cartId, item.productId, item.quantity, product.price);
      }
    }
    return cartService.getCart(userId);
  },
};
