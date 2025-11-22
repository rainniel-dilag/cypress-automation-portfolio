import { loadFixtures } from "../../support/utils";

describe('Page Load & UI Verification', () => {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitCheckOutPage()
  })

  it('Verify the page loads correctly', () => {
    cy.assertPage('Checkout: Your Information', 'checkout-step-one.html')
  })

  it('Verify all input fields exist', () => {
    cy.getDataTest('firstName').should('be.visible')
    cy.getDataTest('lastName').should('be.visible')
    cy.getDataTest('postalCode').should('be.visible')
  })

  it('Verify Continue and Cancel buttons exist', () => {
    cy.getDataTest('cancel').should('be.visible').and('not.be.disabled')
    cy.getDataTest('continue').should('be.visible').and('not.be.disabled')
  })
})

describe('Required Field Validation', () => {
  beforeEach(function() {
    loadFixtures.call(this)
    cy.loginAndVisitCheckOutPage()
  })

  it('Submit with all fields empty', function() {
    cy.fillCheckoutForm({})
    cy.getDataTest('continue').click()
    cy.getDataTest('error').should('contain.text', this.checkOutError.allFieldsEmpty)
  })

  it('Missing First Name', function() {
    cy.getDataTest('continue').click()
    cy.getDataTest('error').should('contain.text', this.checkOutError.firstNameRequired)
  })

  it('Missing Last Name', function() {
    cy.fillCheckoutForm({firstName: 'Test', postalCode: '1011'})
    cy.getDataTest('continue').click()
    cy.getDataTest('error').should('contain.text', this.checkOutError.lastNameRequired)
  })

  it('Missing Postal Code', function() {
    cy.fillCheckoutForm({firstName: 'Test', lastName: 'User'})
    cy.getDataTest('continue').click()
    cy.getDataTest('error').should('contain.text', this.checkOutError.postalCodeRequired)
  })
})

describe('Field Behavior & Input Tests', () => {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitCheckOutPage()
  })

  // The form doesnt include validation yet, the purpose of test under 
  // this describe block is just to see the current state of the form

  it('Verify whitespace-only input', function() {
    cy.fillCheckoutForm({firstName: 'Test', lastName: '       ', postalCode: '    '})
    cy.getDataTest('continue').click()
    cy.assertUrlIncludes('/checkout-step-two.html')
    cy.getDataTest('error').should('not.exist')

    cy.note('The form accepts whitespace-only values without showing any validation errors.')

    // Observation: this indicates missing input sanitization and required-field checks.
  })

  it('Verify trimming of inputs', function() {
    cy.fillCheckoutForm({firstName: '  Test  ', lastName: 'Us er', postalCode: '1234   '})
    cy.getDataTest('continue').click()
    cy.assertUrlIncludes('/checkout-step-two.html')
    cy.getDataTest('error').should('not.exist')
    cy.note('The form allows values with leading and trailing spaces and proceeds without issues.')

    // Observation: trimming does not occur, which may lead to inconsistent stored data.
  })

  it('Verify postal code accepts numbers', function() {
    cy.fillCheckoutForm({firstName: 'Test', lastName: 'User', postalCode: '1234'})
    cy.getDataTest('continue').click()
    cy.assertUrlIncludes('/checkout-step-two.html')
    cy.getDataTest('error').should('not.exist')
    cy.note('Numeric postal codes are accepted and the user proceeds to the  next step.')

    // This matches expected behavior, but validation rules still appear minimal.
  })

  it('Verify postal code rejects invalid characters', function() {
    cy.fillCheckoutForm({firstName: 'Test', lastName: 'User', postalCode: 'ABC!@#$'})
    cy.getDataTest('continue').click()
    cy.assertUrlIncludes('/checkout-step-two.html')
    cy.getDataTest('error').should('not.exist')
    cy.note('The form accepts letters and symbols in the postal code field without any error.')

    // Observation: validation for allowed characters is missing, which could lead to data quality issues.
  })

  it('Max/min length check for fields', function() {
    const longFirstName = 'Test'.repeat(51)
    const longLastName = 'Test'.repeat(51)
    const longPostalCode = '12345'.repeat(51)

    cy.fillCheckoutForm({firstName: longFirstName, lastName: longLastName, postalCode: longPostalCode})
    cy.getDataTest('continue').click()
    cy.assertUrlIncludes('/checkout-step-two.html')
    cy.getDataTest('error').should('not.exist')
    cy.getDataTest('cancel').click()
    cy.getDataTest('shopping-cart-link').click()
    cy.getDataTest('checkout').click()
    cy.fillCheckoutForm({firstName: 'A', lastName: 'B', postalCode: '1'})
    cy.getDataTest('continue').click()
    cy.assertUrlIncludes('/checkout-step-two.html')
    cy.getDataTest('error').should('not.exist')
    cy.note('Very long inputs do not trigger errors and the UI remains functional. Short inputs are also accepted without restrictions.')

    // Observation: the form has no length limits for any field, which may not be ideal for real-world data.
  })
})

describe('Navigation Tests', () => {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitInventoryPage()   
  })

  beforeEach(function(){
    cy.itemCheckOut(this.products.backpack.cart)
  })

  it('Continue button leads to Step Two', function() {
    cy.fillCheckoutForm({firstName: 'Test', lastName: 'User', postalCode: '3211'})
    cy.getDataTest('continue').click()
    cy.assertPage('Checkout: Overview', 'checkout-step-two.html')
    cy.getDataTest('payment-info-label').should('be.visible')
  })

  it('Cancel button returns to Cart', function() {
    cy.getDataTest('cancel').click()
    cy.assertPage('Your Cart', '/cart.html')
    cy.getDataTest('shopping-cart-badge').should('have.text', '1')
    cy.getDataTest('inventory-item-name').should('contain.text', this.products.backpack.name)
    cy.getDataTest('inventory-item-desc').should('contain.text', this.products.backpack.desc)
  })

  it('Browser back & forward clears form inputs', function() {
    cy.fillCheckoutForm({firstName: 'Test', lastName: 'User', postalCode: '4432'})
    cy.go('back')
    cy.go('forward')
    cy.getDataTest('firstName').should('be.empty')
    cy.getDataTest('lastName').should('be.empty')
    cy.getDataTest('postalCode').should('be.empty')
  })
})

describe('Error Message Behavior', function() {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitCheckOutPage()
  })

  it('First name error icon visibility', () => {
    cy.fillCheckoutForm({lastName: 'User', postalCode: '2311'})
    cy.errorIconCheck('firstName')
  })

  it('Last name error icon visibility', () => {
    cy.fillCheckoutForm({firstName: 'Test', postalCode: '2311'})
    cy.errorIconCheck('lastName')
  })

  it('Postal code error icon visibility', () => {
    cy.fillCheckoutForm({firstName: 'Test', lastName: 'User'})
    cy.errorIconCheck('postalCode')
  })

  it('Error disappears after closing error modal', function() {
    cy.getDataTest('continue').click()
    cy.errorIconCheck('firstName')
    cy.errorIconCheck('lastName')
    cy.errorIconCheck('postalCode')
    cy.getDataTest('error').should('be.visible')
    cy.getDataTest('error-button').click()
    cy.getDataTest('firstName').parent().find('.error_icon').should('not.exist')
    cy.getDataTest('lastName').parent().find('.error_icon').should('not.exist')
    cy.getDataTest('postalCode').parent().find('.error_icon').should('not.exist')
  })

})