export const loadFixtures = function(){
  cy.fixture('users').as('users')
  cy.fixture('errors').as('errors')
  cy.fixture('products').as('products')
  cy.fixture('checkOutError').as('checkOutError')
  cy.fixture('routes').as('routes')
}


















