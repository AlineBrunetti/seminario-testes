export interface OrderCalculation {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export function calculateOrderTotal(
  unitPrice: number,
  quantity: number,
  coupon?: string
): OrderCalculation {
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    throw new Error('Preço unitário deve ser maior que zero');
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Quantidade deve ser um número inteiro positivo');
  }

  const subtotal = unitPrice * quantity;
  let discountRate = 0;

  if (quantity >= 10) {
    discountRate += 0.1;
  }

  if (coupon !== undefined && coupon !== '') {
    if (typeof coupon !== 'string' || coupon.toUpperCase() !== 'PROMO15') {
      throw new Error('Cupom inválido');
    }
    discountRate += 0.15;
  }

  const discount = Number((subtotal * discountRate).toFixed(2));
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= 500 ? 0 : 35;
  const total = Number((afterDiscount + shipping).toFixed(2));

  return { subtotal, discount, shipping, total };
}
