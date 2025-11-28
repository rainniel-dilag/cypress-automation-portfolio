describe('Viewport & Responsiveness Tests', () => {
  beforeEach(() => {
    cy.loginAndVisitInventoryPage()
  })

  const mobileSizes = ['iphone-5', 'iphone-xr', 'samsung-note9']

  mobileSizes.forEach((phone) => {
    it(`Test viewports of mobile: ${phone}`, () => {
      cy.viewport(phone)
      cy.get('.bm-burger-button').should('be.visible').and('not.disabled').click()
      cy.get('.bm-item-list').should('be.visible')
      cy.get('.bm-cross-button').should('be.visible').and('not.disabled').click()
      cy.get('.bm-item-list').should('not.be.visible')
      cy.getDataTest('inventory-list').should('be.visible')
      cy.getDataTest('shopping-cart-link').should('be.visible').and('not.disabled')

      cy.getDataTest('inventory-item').each(($item) => {
        cy.wrap($item).first().within(() => {
          cy.get('[data-test^="add-to-cart"]').should('be.visible').and('not.disabled')
        })
      })
    })
  })
})


