import { db } from '../../src/db';
import { processNewOrder } from '../../src/orderService';

describe('Testes de Integração - Serviço de Pedidos + Cálculo + Banco (orderService.ts)', () => {
  beforeEach(() => {
    db.reset();
  });

  it('integra busca de produto, cálculo, registro do pedido e baixa de estoque', () => {
    const result = processNewOrder({
      customerName: 'Tech Solutions LTDA',
      productId: 'prod-1',
      quantity: 2,
      coupon: 'PROMO15'
    });

    expect(result.calculation.total).toBe(460);
    expect(result.order.id).toBe('ord-1');
    expect(db.getProductById('prod-1')?.stock).toBe(13);
    expect(db.getOrders()).toHaveLength(1);
  });

  it('bloqueia pedidos acima do estoque sem alterar o banco', () => {
    expect(() =>
      processNewOrder({
        customerName: 'Cliente Grande',
        productId: 'prod-2',
        quantity: 10
      })
    ).toThrow('Estoque insuficiente. Disponível: 5');

    expect(db.getProductById('prod-2')?.stock).toBe(5);
    expect(db.getOrders()).toHaveLength(0);
  });

  it('repassa erro de cupom inválido sem abater estoque', () => {
    expect(() =>
      processNewOrder({
        customerName: 'Empresa Teste',
        productId: 'prod-1',
        quantity: 1,
        coupon: 'CUPOM_INEXISTENTE'
      })
    ).toThrow('Cupom inválido');

    expect(db.getProductById('prod-1')?.stock).toBe(15);
    expect(db.getOrders()).toHaveLength(0);
  });
});
