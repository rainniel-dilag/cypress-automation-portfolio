import { expect, should } from "chai";
import { loadFixtures } from "../../support/utils";

describe('Page Load & UI Verification', function() {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitInventoryPage()
  })

  it('Verify page loads correctly', function() {
    cy.itemCheckOut(this.products.backpack.cart)
    cy.completeCheckOutForm()
    cy.assertPage('Checkout: Overview', '/checkout-step-two.html')
  })

  it('Verify all summary elements exist', function() {
    cy.itemCheckOut(this.products.backpack.cart)
    cy.completeCheckOutForm()
    cy.get('.cart_item_label').within(() => {
      cy.getDataTest('inventory-item-name').should('be.visible').and('contain.text', this.products.backpack.name)
      cy.getDataTest('inventory-item-desc').should('be.visible').and('contain.text', this.products.backpack.desc)
      cy.getDataTest('inventory-item-price').should('be.visible').and('contain.text', this.products.backpack.price)
    })
    
    cy.getDataTest('payment-info-label').should('be.visible')
    cy.getDataTest('shipping-info-label').should('be.visible')
    cy.getDataTest('total-info-label').should('be.visible')
    cy.getDataTest('tax-label').should('be.visible')
    cy.getDataTest('total-label').should('be.visible')
    cy.getDataTest('cancel').should('be.visible').and('not.be.disabled')
    cy.getDataTest('finish').should('be.visible').and('not.be.disabled')
  })

  it('Verify cart items match previous pages', function() {
    const itemsToAdd = [this.products.backpack, this.products.bikeLight]

    cy.addItemsToCart(itemsToAdd)
    cy.getDataTest('shopping-cart-link').click()
    cy.assertPage('Your Cart', '/cart.html');
    cy.getDataTest('shopping-cart-badge').should('contain.text', itemsToAdd.length.toString())
    
    cy.get('.cart_item').each(($item, index) => {
      const expectedItems = itemsToAdd[index];

      cy.wrap($item).find('.inventory_item_name').should('contain.text', expectedItems.name);
      cy.wrap($item).find('.inventory_item_desc').should('contain.text', expectedItems.desc);
      cy.wrap($item).find('.inventory_item_price').should('contain.text', expectedItems.price)
      cy.wrap($item).find('.cart_quantity').should('have.text', '1')
    })

    cy.getDataTest('checkout').click()
    cy.completeCheckOutForm()
    cy.assertPage('Checkout: Overview', '/checkout-step-two.html')

    cy.get('.cart_item').each(($item, index) => {
      const expectedItems = itemsToAdd[index]
      cy.wrap($item).find('[data-test="inventory-item-name"]').should('contain.text', expectedItems.name)
      cy.wrap($item).find('[data-test="inventory-item-desc"]').should('contain.text', expectedItems.desc)
      cy.wrap($item).find('[data-test="inventory-item-price"]').should('contain.text', expectedItems.price)
      cy.wrap($item).find('[data-test="item-quantity"]').should('have.text', '1')
    })
  })

})

describe('Price & Calculation Validation', () => {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitInventoryPage()
  })
  
  it('Verify item price accuracy', function() {
    const itemsToAdd = [this.products.backpack, this.products.bikeLight]

    cy.addItemsToCart(itemsToAdd)

    itemsToAdd.forEach(item => {
      cy.contains('.cart_item', item.name).within(() => {
      cy.getDataTest('inventory-item-price').should('have.text', item.price)
      cy.getDataTest('item-quantity').should('have.text', '1')
      })
    })
    cy.getDataTest('checkout').click()
    cy.assertPage('Checkout: Your Information', '/checkout-step-one.html')
    cy.completeCheckOutForm()

    itemsToAdd.forEach(item => {
      cy.contains('.cart_item', item.name).within(() => {
        cy.getDataTest('inventory-item-price').should('have.text', item.price)
        cy.getDataTest('item-quantity').should('have.text', '1')
      })
    })
  })

  it('Verify subtotal is correct', function() {
    const itemsToAdd = [this.products.backpack, this.products.bikeLight, this.products.jacket]

    cy.addItemsToCart(itemsToAdd)

    let expectedSubtotal = 0

    itemsToAdd.forEach(item => {
      const priceNumber = parseFloat(item.price.replace("$", ""))
      expectedSubtotal += priceNumber    
    })
    expectedSubtotal = expectedSubtotal.toFixed(2)
    cy.log(expectedSubtotal)

    cy.getDataTest('checkout').click()
    cy.assertPage('Checkout: Your Information', '/checkout-step-one.html')
    cy.completeCheckOutForm()

    cy.getDataTest('subtotal-label').then($label => {
      const textOnPage = $label.text()
      const actualSubtotal = parseFloat(textOnPage.replace("Item total: $", ""))
      expect(expectedSubtotal).to.equal(actualSubtotal.toFixed(2))

      cy.log('My Total: ' + expectedSubtotal)
      cy.log('Real Total: ' + actualSubtotal.toFixed(2))
    })
  })

  it('Verify tax calculation', function(){
    const itemsToAdd = [this.products.backpack, this.products.bikeLight, this.products.jacket]

    cy.addItemsToCart(itemsToAdd)

    let expectedSubtotal = 0;
    
    itemsToAdd.forEach(item => {
      const priceNumber = parseFloat(item.price.replace("$", ""))
      expectedSubtotal += priceNumber
    })

    expectedSubtotal = expectedSubtotal.toFixed(2)
    cy.log(`Expected Total: ${expectedSubtotal}`)

    cy.getDataTest('checkout').click()
    cy.completeCheckOutForm()

    let expectedTax = parseFloat(expectedSubtotal) * 0.08

    expectedTax = expectedTax.toFixed(2)
    cy.log(`Expected tax: ${expectedTax}`)

    cy.getDataTest('tax-label').then(($taxPrice) => {
      const textOnPage = $taxPrice.text()
      let actualTax = parseFloat(textOnPage.replace("Tax: $", ""))
      actualTax = actualTax.toFixed(2)
      expect(expectedTax).to.equal(actualTax)
      cy.log(`Expected Tax: ${expectedTax} = Actual Tax: ${actualTax}`)
    })
  })

  it('Verify final total', function() {
    const itemsToAdd = [this.products.backpack, this.products.bikeLight, this.products.jacket]

    cy.addItemsToCart(itemsToAdd)

    let expectedSubtotal = 0;

    itemsToAdd.forEach(item => {
      const priceNumber = parseFloat(item.price.replace("$", ""))
      expectedSubtotal += priceNumber
    })
    expectedSubtotal = expectedSubtotal.toFixed(2)
    cy.log(expectedSubtotal)

    let expectedTax = parseFloat(expectedSubtotal * 0.08)
    expectedTax = expectedTax.toFixed(2)
    cy.log(expectedTax)

    cy.getDataTest('checkout').click()
    cy.completeCheckOutForm()

    let expectedTotal = parseFloat(expectedSubtotal) + parseFloat(expectedTax)
    expectedTotal = expectedTotal.toFixed(2)
    cy.log(expectedTotal)

    cy.getDataTest('total-label').then($totalPrice => {
      const textOnPage = $totalPrice.text()
      let actualTotal = parseFloat(textOnPage.replace("Total: $", ""))
      actualTotal = actualTotal.toFixed(2)
      expect(expectedTotal).to.equal(actualTotal)
      cy.log(`Expected total: ${expectedTotal}`)
      cy.log(`Actual total: ${actualTotal}`)
    })
  })
})

describe('Button & Navigation Tests', () => {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitInventoryPage()
  })

  it('Cancel button returns to Inventory', function() {
    const itemsToAdd = [this.products.backpack, this.products.bikeLight]
    cy.addItemsToCart(itemsToAdd)
    cy.getDataTest('checkout').click()
    cy.completeCheckOutForm()
    cy.assertPage('Checkout: Overview', '/checkout-step-two.html')
    cy.getDataTest('cancel').click()
    cy.assertPage('Products', '/inventory.html')
  })

  it('Finish button completes checkout', function() {
    const itemsToAdd = [this.products.backpack, this.products.bikeLight]
    cy.addItemsToCart(itemsToAdd)
    cy.getDataTest('checkout').click()
    cy.completeCheckOutForm()
    cy.assertPage('Checkout: Overview', '/checkout-step-two.html')
    cy.getDataTest('finish').click()
    cy.assertPage('Checkout: Complete!', '/checkout-complete.html')
    cy.getDataTest('back-to-products').should('be.visible').and('not.disabled')
    cy.getDataTest('complete-header').should('have.text', 'Thank you for your order!')
  })

  it('Browser Back returns with no data intact', function() {
    const itemsToAdd = [this.products.backpack, this.products.bikeLight]
    cy.addItemsToCart(itemsToAdd)
    cy.getDataTest('checkout').click()
    cy.completeCheckOutForm()
    cy.assertPage('Checkout: Overview', '/checkout-step-two.html')
    cy.go('back')
    cy.get('.checkout_info').within(() => {
      cy.getDataTest('firstName').should('be.empty')
      cy.getDataTest('lastName').should('be.empty')
      cy.getDataTest('postalCode').should('be.empty')
    })
  })
})

describe('Cart Item Integrity', () => {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitInventoryPage()
  })

  it('Verify removed items dont appear', function() {
    const itemsToAdd = [this.products.backpack, this.products.bikeLight, this.products.onesie]

    const itemToRemove = itemsToAdd[0]

    cy.addItemsToCart(itemsToAdd)
    cy.getDataTest('shopping-cart-badge').should('have.text', '3')
    cy.getDataTest(`remove-${itemToRemove.cart}`).click()
    cy.getDataTest('shopping-cart-badge').should('have.text', '2')
    cy.getDataTest('checkout').click()
    cy.completeCheckOutForm()
    cy.getDataTest('shopping-cart-badge').should('have.text', '2')
    cy.getDataTest('inventory-item').should('not.contain', itemToRemove.name)
    cy.getDataTest('inventory-item').should('not.contain', itemToRemove.desc)
    cy.getDataTest('inventory-item').should('not.contain', itemToRemove.price)
    cy.getDataTest('inventory-item').should('have.length', 2)
  })

  it('Verify multiple items display correctly', function() {
    const itemsToAdd = [this.products.backpack, this.products.bikeLight, this.products.tShirt, this.products.jacket]

    cy.addItemsToCart(itemsToAdd)
    cy.getDataTest('checkout').click()
    cy.completeCheckOutForm()
    cy.getDataTest('inventory-item').should('have.length', itemsToAdd.length)

    itemsToAdd.forEach(item => {
      cy.contains('.cart_item_label', item.name).within(() => {
        cy.getDataTest('inventory-item-name').should('have.text', item.name)
        cy.getDataTest('inventory-item-desc').should('have.text', item.desc)
        cy.getDataTest('inventory-item-price').should('have.text', item.price)
      })
    })
  })
})

describe('Session & Security Tests', () => {
  beforeEach(function(){
    loadFixtures.call(this)
  })

  it('Direct access without Step One', function() {
    cy.visit('/checkout-step-two.html', {failOnStatusCode: false})
    cy.assertError(this.errors.checkOutTwoAccessDenied)
    cy.assertUrlIncludes('/')
    cy.getDataTest('login-button').should('be.visible')
  })

  it('Session persistence', function() {
    cy.loginAndVisitCheckOutOverviewPage()
    cy.assertPage('Checkout: Overview', '/checkout-step-two.html')
    cy.reload()
    cy.assertPage('Checkout: Overview', '/checkout-step-two.html')
  })

  it('Logout from overview', function() {
    cy.loginAndVisitCheckOutOverviewPage()
    cy.assertPage('Checkout: Overview', '/checkout-step-two.html')
    cy.assertLogOut()
  })
})
