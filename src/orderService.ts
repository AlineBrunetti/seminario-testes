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

  const product = typeof productId === 'string' ? db.getProductById(productId) : undefined;
  if (!product) {
    throw new Error('Produto não encontrado');
  }

  const parsedQuantity = Number(quantity);
  if (parsedQuantity <= 0 || !Number.isInteger(parsedQuantity)) {
    throw new Error('Quantidade deve ser um número inteiro positivo');
  }
  if (parsedQuantity > product.stock) {
    throw new Error(`Estoque insuficiente. Disponível: ${product.stock}`);
  }

  if (coupon !== undefined && typeof coupon !== 'string') {
    throw new Error('Cupom inválido');
  }
  const calculation = calculateOrderTotal(product.price, parsedQuantity, coupon || undefined);

  db.updateStock(product.id, parsedQuantity);
  const order = db.createOrder({
    customerName: customerName.trim(),
    productId: product.id,
    quantity: parsedQuantity,
    total: calculation.total
  });

  return { order, calculation };
}