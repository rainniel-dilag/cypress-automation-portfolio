describe('Viewport & Responsiveness Tests', () => {
  beforeEach(() => {
    cy.loginAndVisitInventoryPage()
  })

  describe('Mobile Viewports', () => {
    const mobileSizes = ['iphone-5', 'iphone-x', 'samsung-note9']

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
          cy.wrap($item).within(() => {
            cy.get('[data-test^="add-to-cart"]').should('be.visible').and('not.disabled')
          })
        })
      })
    })
  })

  describe('Tablet Viewports', () => {
    const tabletDevices= ['ipad-mini', 'ipad-2']

    tabletDevices.forEach((tablet) => {
      it(`Test viewports of mobile: ${tablet}`, () => {
        cy.viewport(tablet)
        cy.get('.bm-burger-button').should('be.visible').and('not.disabled').click()
        cy.get('.bm-item-list').should('be.visible')
        cy.get('.bm-cross-button').should('be.visible').and('not.disabled').click()
        cy.get('.bm-item-list').should('not.be.visible')
        cy.getDataTest('inventory-list').should('be.visible')
        cy.getDataTest('shopping-cart-link').should('be.visible').and('not.disabled')

        cy.getDataTest('inventory-item').each(($item) => {
          cy.wrap($item).within(() => {
            cy.get('[data-test^="add-to-cart"]').should('be.visible').and('not.disabled')
          })
        })
      })
    })
  })

  describe('Desktop Viewports', () => {
    const desktopDevices= ['macbook-11', 'macbook-13', 'macbook-15']

    desktopDevices.forEach((desktop) => {
      it(`Test viewports of desktop: ${desktop}`, () => {
        cy.viewport(desktop)
        cy.get('.bm-burger-button').should('be.visible').and('not.disabled').click()
        cy.get('.bm-item-list').should('be.visible')
        cy.get('.bm-cross-button').should('be.visible').and('not.disabled').click()
        cy.get('.bm-item-list').should('not.be.visible')
        cy.getDataTest('inventory-list').should('be.visible')
        cy.getDataTest('shopping-cart-link').should('be.visible').and('not.disabled')

        cy.getDataTest('inventory-item').each(($item) => {
          cy.wrap($item).within(() => {
            cy.get('[data-test^="add-to-cart"]').should('be.visible').and('not.disabled')
          })
        })
      })
    })
  })
})




