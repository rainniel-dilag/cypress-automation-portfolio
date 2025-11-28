import { loadFixtures } from "../support/utils"

describe('Footer Visibility & Layout', () => {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.visit('/')
    cy.logInAsStandardUser()
  })

  it('Footer is visible on all pages', function() {
    const allRoutes = Object.values(this.routes)

    allRoutes.forEach((page) => {
      cy.visit(page, {failOnStatusCode: false})
      cy.getDataTest('footer').should('be.visible').within(() => {
        cy.get('.social').each(($icon) => {
          cy.wrap($icon).find('[class^="social_"]').should('be.visible')
        })
      })
    })
  })

  it('Footer remains at bottom of viewport', () => {
    cy.scrollTo('bottom')
    cy.getDataTest('footer').should('be.visible')
    
    cy.get('.social').each(($icon) => {
      cy.wrap($icon).find('[class^="social_"]').should('be.visible')
    })
  })

  it('Footer layout is consistent across pages', () => {
    cy.loginAndVisitCartPage()
    cy.getDataTest('footer').should('be.visible')
    .and('have.css', 'background-color', 'rgb(19, 35, 34)')
  })
})

describe('Social Media Link Functionality', () => {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitInventoryPage()
  })

  it('Twitter icon link works', () => {
    cy.scrollTo('bottom')
    cy.getDataTest('footer').should('be.visible')
    cy.getDataTest('social-twitter').should('be.visible').and('have.attr', 'href', 'https://twitter.com/saucelabs').and('have.attr', 'target', '_blank')
  })

  it('Facebook icon link works', () => {
    cy.scrollTo('bottom')
    cy.getDataTest('footer').should('be.visible')
    cy.getDataTest('social-facebook').should('be.visible').and('have.attr', 'href', 'https://www.facebook.com/saucelabs').and('have.attr', 'target', '_blank')
  })

  it('LinkedIn icon link works', () => {
    cy.scrollTo('bottom')
    cy.getDataTest('footer').should('be.visible')
    cy.getDataTest('social-linkedin').should('be.visible').and('have.attr', 'href', 'https://www.linkedin.com/company/sauce-labs/').and('have.attr', 'target', '_blank')
  })

  it('Broken social link handling (Twitter 404 Simulation)', () => {
    // 1. Intercept
    cy.intercept('GET', 'https://twitter.com/saucelabs', {
      statusCode: 404,
      body: '<h1>404 Error</h1>'
    }).as('brokenTwitter')

    // 2. Click (Modify target to keep in same tab)
    cy.getDataTest('social-twitter')
      .invoke('removeAttr', 'target')
      .click()

    // 3. Wait
    cy.wait('@brokenTwitter')

    // 4. Assert Cross-Origin
    cy.origin('https://twitter.com', () => {
      cy.contains('404 Error').should('be.visible')
    })
  })
})

describe('Copyright Text', () => {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitInventoryPage()
  })

  it('Verify copyright text exists', () => {
    cy.scrollTo('bottom')
    cy.getDataTest('footer').should('be.visible')
    cy.getDataTest('footer-copy').should('be.visible').and('have.text', '© 2025 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy')
  })

})


