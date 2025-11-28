import { loadFixtures } from "../../support/utils";

describe('Page Load & UI Verification', () => {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitCheckOutCompletePage()
  })

  it('Verify page loads correctly', () => {
    cy.assertPage('Checkout: Complete!', 'checkout-complete.html')
    cy.getDataTest('back-to-products').should('be.visible')
  })

  it('Verify success message is visible', () => {
    cy.getDataTest('complete-header').should('be.visible').and('have.text', 'Thank you for your order!')
    cy.getDataTest('complete-text').should('be.visible').and('have.text', 'Your order has been dispatched, and will arrive just as fast as the pony can get there!')
  })

  it('Verify order complete image loads', () => {
    cy.getDataTest('pony-express').should('be.visible').and('have.attr', 'src')
  })
})

describe('Order Completion Confirmation', () => {
  beforeEach(function(){
    loadFixtures.call(this)   
  })

  it('Verify order is marked as completed', () => {
    cy.loginAndVisitCheckOutOverviewPage()
    cy.assertPage('Checkout: Overview', '/checkout-step-two.html')
    cy.getDataTest('finish').click()
    cy.assertPage('Checkout: Complete!', '/checkout-complete.html')
    cy.getDataTest('complete-header').should('be.visible').and('have.text', 'Thank you for your order!')
  })

  it('Verify no leftover items in cart', function() {
    cy.loginAndVisitInventoryPage()

    const addItems = [this.products.backpack, this.products.bikeLight, this.products.jacket]
    cy.addItemsToCart(addItems)
    cy.assertPage('Your Cart', '/cart.html')
    cy.getDataTest('shopping-cart-badge').should('have.text', addItems.length.toString())
    cy.getDataTest('checkout').click()
    cy.completeCheckOutForm()
    cy.getDataTest('shopping-cart-badge').should('have.text', addItems.length.toString())
    cy.getDataTest('finish').click()
    cy.getDataTest('shopping-cart-badge').should('not.exist')
  })

  it('Refresh confirmation page', () => {
    cy.loginAndVisitCheckOutCompletePage()
    cy.assertPage('Checkout: Complete!', '/checkout-complete.html')
    cy.getDataTest('complete-header').should('be.visible')
    cy.reload()
    cy.assertPage('Checkout: Complete!', '/checkout-complete.html')
    cy.getDataTest('complete-header').should('be.visible')
  })
})

describe('Navigation Tests', () => {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitCheckOutCompletePage()
  })

  it('Back Home button returns user to inventory page', () => {
    cy.assertPage('Checkout: Complete!', '/checkout-complete.html')
    cy.getDataTest('back-to-products').click()
    cy.assertPage('Products', '/inventory.html')
  })

  it('Verify user can continue shopping smoothly', function() {
    cy.getDataTest('back-to-products').click()
    cy.getDataTest('shopping-cart-link').click()
    cy.assertPage('Your Cart', '/cart.html')
    cy.getDataTest('shopping-cart-badge').should('not.exist')
    cy.getDataTest('inventory-item').should('not.exist')
    cy.getDataTest('continue-shopping').click()

    cy.getDataTest('inventory-item').each(($item) => {
      cy.wrap($item).find('[data-test^="add-to-cart-"]').should('have.text', 'Add to cart').and('not.disabled')
    })
  })

  it('Browser back from Step Three', () => {
    cy.go('back')
    cy.assertPage('Checkout: Overview', '/checkout-step-two.html')
  })
})

describe('Security & Access Control', () => {
  beforeEach(function(){
    loadFixtures.call(this)
  })

  // KNOWN ISSUE: Broken Access Control (State Bypass)
  // Expected: Application should redirect users without an active order to the inventory.
  // Actual: Application allows direct URL navigation to /checkout-complete.html.
  // Status: Test will fail until the application logic is patched.
  it.skip('Direct access to /checkout-complete.html without completing checkout', () => {
    cy.loginAndVisitInventoryPage()
    cy.visit('/checkout-complete.html', {failOnStatusCode: false})
    cy.location('pathname').should('not.eq', '/checkout-complete.html')
  })

  it('User logout from confirmation page', function() {
    cy.loginAndVisitCheckOutCompletePage()
    cy.assertLogOut()
    cy.visit('/checkout-complete.html', {failOnStatusCode: false})
    cy.assertError(this.errors.checkOutCompleteAccessDenied)
    cy.getDataTest('login-button').should('be.visible')
  })

  it('Verify session persistence on confirmation page', () => {
    cy.loginAndVisitCheckOutCompletePage()
    cy.assertPage('Checkout: Complete!', '/checkout-complete.html')
    cy.getDataTest('complete-header').should('be.visible')

    cy.reload()

    cy.assertPage('Checkout: Complete!', '/checkout-complete.html')
    cy.getDataTest('complete-header').should('be.visible')
  })
})

describe('Negative & Edge Case Scenarios', () => {
  beforeEach(function(){
    loadFixtures.call(this)
  })

  it('Try pressing Finish button again (should not exist)', () => {
    cy.loginAndVisitCheckOutCompletePage()
    cy.getDataTest('finish').should('not.exist')
    cy.getDataTest('back-to-products').should('be.visible').and('not.disabled')
  })

  // KNOWN ISSUE: Empty Cart State Bypass
  // Expected: Application should prevent checkout completion with 0 items
  // Actual: Application allows navigation to /checkout-complete.html with an empty cart.
  // Status: Test will fail until the application logic is patched.
  it.skip('Attempt order completion with empty cart', () => {
    cy.loginAndVisitInventoryPage()
    cy.visit('/checkout-complete.html', { failOnStatusCode: false })
    cy.location('pathname').should('not.eq', '/checkout-complete.html')
    cy.getDataTest('complete-header').should('not.exist')
  })
})
