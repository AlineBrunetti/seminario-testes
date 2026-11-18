export class OrderPage {
  visit() {
    cy.visit('/');
  }

  fillOrderForm(customer: string, product: string, quantity: string, coupon?: string) {
    cy.get('[data-cy="input-customer"]').clear().type(customer);
    cy.get('[data-cy="select-product"]').select(product);
    cy.get('[data-cy="input-quantity"]').clear().type(quantity);
    if (coupon) {
      cy.get('[data-cy="input-coupon"]').clear().type(coupon);
    }
  }

  submit() {
    cy.get('[data-cy="btn-submit"]').click();
  }

  assertSuccessMessage(expectedText: string) {
    cy.get('[data-cy="alert-success"]').should('be.visible').and('contain.text', expectedText);
  }

  assertErrorMessage(expectedText: string) {
    cy.get('[data-cy="alert-error"]').should('be.visible').and('contain.text', expectedText);
  }
}
