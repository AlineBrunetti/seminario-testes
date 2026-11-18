import { db } from './db';
import { calculateOrderTotal } from './pricing';

export interface CreateOrderInput {
  customerName: string;
  productId: string;
  quantity: number;
  coupon?: string;
}

export function processNewOrder(input: CreateOrderInput) {
  const { customerName, productId, quantity, coupon } = input;

  if (typeof customerName !== 'string' || customerName.trim().length < 3) {
    throw new Error('Nome do cliente é obrigatório (mín. 3 letras)');
  }
  const product = db.getProductById(productId);
  if (typeof productId !== 'string' || !product) {
    throw new Error('Produto não encontrado');
  }
  if (coupon !== undefined && typeof coupon !== 'string') {
    throw new Error('Cupom inválido');
  }

  const parsedQuantity = Number(quantity);
  const calculation = calculateOrderTotal(product.price, parsedQuantity, coupon || undefined);

  if (parsedQuantity > product.stock) {
    throw new Error(`Estoque insuficiente. Disponível: ${product.stock}`);
  }

  db.updateStock(product.id, parsedQuantity);
  const order = db.createOrder({
    customerName: customerName.trim(),
    productId: product.id,
    quantity: parsedQuantity,
    total: calculation.total
  });

  return { order, calculation };
}
