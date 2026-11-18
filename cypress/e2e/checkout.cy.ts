import { OrderPage } from '../support/pages/OrderPage';

describe('Fluxo E2E - Checkout de Pedidos B2B', () => {
  const orderPage = new OrderPage();

  beforeEach(() => {
    cy.request('POST', '/api/reset');
    orderPage.visit();
  });

  it('cria um pedido usando Fixture e Page Object e exibe o cálculo', () => {
    cy.fixture('orderData').then((data) => {
      const { customer, product, quantity, coupon } = data.validOrder;

      orderPage.fillOrderForm(customer, product, quantity, coupon);
      orderPage.submit();
      orderPage.assertSuccessMessage('Pedido #ord-1 confirmado!');
      orderPage.assertSuccessMessage('Total Final: R$ 460.00');
    });
  });

  it('exibe erro quando o estoque é insuficiente', () => {
    cy.fixture('orderData').then((data) => {
      const { customer, product, quantity } = data.outOfStockOrder;

      orderPage.fillOrderForm(customer, product, quantity);
      orderPage.submit();
      orderPage.assertErrorMessage('Estoque insuficiente. Disponível: 5');
    });
  });

  it('valida o payload enviado e conclui o pedido', () => {
    cy.intercept('POST', '/api/orders').as('createOrderReq');

    orderPage.fillOrderForm('Empresa Interceptada', 'prod-1', '1');
    orderPage.submit();

    cy.wait('@createOrderReq').its('request.body').should('deep.equal', {
      customerName: 'Empresa Interceptada',
      productId: 'prod-1',
      quantity: 1,
      coupon: ''
    });
    orderPage.assertSuccessMessage('Total Final: R$ 285.00');
  });

  it('exibe mensagem amigável quando a API responde com erro 500', () => {
    cy.intercept('POST', '/api/orders', {
      statusCode: 500,
      body: { error: 'Falha crítica no banco de dados' }
    }).as('serverCrash');

    orderPage.fillOrderForm('Cliente Teste 500', 'prod-1', '1');
    orderPage.submit();
    cy.wait('@serverCrash');
    orderPage.assertErrorMessage('Falha crítica no banco de dados');
  });
});
