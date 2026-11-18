import { calculateOrderTotal } from '../../src/pricing';

describe('Testes Unitários - Cálculo de Pedido (pricing.ts)', () => {
  it('calcula um pedido abaixo de R$ 500 com cobrança de frete', () => {
    expect(calculateOrderTotal(200, 2)).toEqual({
      subtotal: 400,
      discount: 0,
      shipping: 35,
      total: 435
    });
  });

  it('aplica desconto por volume e frete grátis a partir de R$ 500 pós-desconto', () => {
    const result = calculateOrderTotal(100, 10);

    expect(result.discount).toBe(100);
    expect(result.shipping).toBe(0);
    expect(result.total).toBe(900);
  });

  it('acumula desconto por volume com o cupom PROMO15', () => {
    const result = calculateOrderTotal(100, 10, 'PROMO15');

    expect(result.discount).toBe(250);
    expect(result.total).toBe(750);
  });

  it('rejeita preço, quantidade e cupom inválidos', () => {
    expect(() => calculateOrderTotal(0, 1)).toThrow('Preço unitário deve ser maior que zero');
    expect(() => calculateOrderTotal(100, 0)).toThrow(
      'Quantidade deve ser um número inteiro positivo'
    );
    expect(() => calculateOrderTotal(100, 1.5)).toThrow(
      'Quantidade deve ser um número inteiro positivo'
    );
    expect(() => calculateOrderTotal(100, 2, 'CUPOM_FALSO')).toThrow('Cupom inválido');
  });
});
