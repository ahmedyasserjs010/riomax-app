import { IProduct } from '../types';

/**
 * Get the effective display price for a product.
 * Returns priceAfterDiscount if > 0, otherwise base price.
 */
export const getProductPrice = (product?: Partial<IProduct> | null): number => {
  if (!product) return 0;
  const priceAfterDiscount = Number(product.priceAfterDiscount ?? 0);
  const price = Number(product.price ?? 0);
  return priceAfterDiscount > 0 ? priceAfterDiscount : price;
};

/**
 * Check if the product has an active valid discount.
 */
export const hasProductDiscount = (product?: Partial<IProduct> | null): boolean => {
  if (!product) return false;
  const discountAmount = Number(product.discountAmountProduct ?? 0);
  const priceAfterDiscount = Number(product.priceAfterDiscount ?? 0);
  const price = Number(product.price ?? 0);
  return discountAmount > 0 && priceAfterDiscount > 0 && priceAfterDiscount < price;
};

/**
 * Get the first secure image URL or undefined as fallback.
 */
export const getProductImage = (product?: Partial<IProduct> | null): string | undefined => {
  return product?.images?.[0]?.secure_url || undefined;
};

/**
 * Clamp quantity between 1 and available stock (or minimum 1).
 */
export const clampQuantity = (qty: number, maxStock?: number): number => {
  const max = typeof maxStock === 'number' && maxStock > 0 ? maxStock : 1;
  return Math.max(1, Math.min(qty, max));
};

/**
 * Calculate the discount percentage between original price and discounted price.
 */
export const calculateDiscountPercentage = (originalPrice: number, discountedPrice: number): number => {
  if (originalPrice <= 0 || discountedPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};
