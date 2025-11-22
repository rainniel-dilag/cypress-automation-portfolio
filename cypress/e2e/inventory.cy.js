import { loadFixtures } from "../support/utils"


describe('Inventory Page - Access Control Tests', () => {
  beforeEach(function(){
    loadFixtures.call(this)
  })

  it('Should prevent direct access without authentication', function() {
    cy.visit('/inventory.html', {failOnStatusCode: false})
    cy.assertError(this.errors.inventoryPageAccessDenied)
    cy.assertUrlIncludes('/')
    cy.getDataTest('login-button').should('be.visible') 
  })

})


describe('Inventory Page - Authenticated User Behavior', () => {
  beforeEach(function() {
    loadFixtures.call(this)
    cy.visit('/')
  })

  it('Should display inventory page after valid login', () => {
    cy.logInAsStandardUser()
    cy.assertInventoryPageLoaded()
  })
 
  it('Should retain access after page refresh', () => {
    cy.logInAsStandardUser()
    cy.assertInventoryPageLoaded()
    cy.reload()
    cy.assertInventoryPageLoaded()
  })
 
})

describe('Inventory Page - Logout and Session Management', () => {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitInventoryPage()
  })

  it('Should log out user and redirect to login page', () => {
    cy.openHamburgerMenu()
    cy.getDataTest('logout-sidebar-link').click()
    cy.assertUrlIncludes('/')
    cy.getDataTest('login-button').should('be.visible')
  })

  it('Should restrict access when navigating back after logout', function() {
    cy.assertLogOut()
    cy.go('back')
    cy.assertError(this.errors.inventoryPageAccessDenied)
  })

})

describe('Inventory Page - Product List Visibility', () =>{
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitInventoryPage()
  })

  it('Should display all products with correct layout', function() {
    cy.getDataTest('inventory-item').should('have.length', 6)
    cy.getDataTest('inventory-item').each(($product) => {
    cy.assertProductCard($product)
    })
  })

})

describe('Inventory Page - Product Details Accuracy', () => {
  beforeEach(function() {
    loadFixtures.call(this)
    cy.loginAndVisitInventoryPage()
  })


  it('Should match each products name, description, price, and image', function() {
    const products = this.products

    Object.values(products).forEach(product => {
      cy.contains('[data-test="inventory-item-name"]', product.name)
        .parents('[data-test="inventory-item"]')
        .within(() => {
          cy.getDataTest('inventory-item-desc').should('include.text', product.desc)
          cy.getDataTest('inventory-item-price').should('include.text', product.price)
          cy.get('img').should('have.attr', 'alt', product.name)
        })
    })
    
  })
})


describe('Inventory Page - Sorting Functionality', () => {
    beforeEach(function() {
    loadFixtures.call(this)
    cy.loginAndVisitInventoryPage()
  })

  it('Should sort products alphabetically from A to Z', () => {
    cy.getDataTest('product-sort-container').select('Name (A to Z)')
    cy.getDataTest('inventory-item-name').then($names => {
    const nameArray = $names.toArray().map(el => el.innerText)
    const sortedNames = [...nameArray].sort()
    expect(nameArray).to.deep.equal(sortedNames)
    })
  })

  it('Should sort products alphabetically from Z to A', () => {
    cy.getDataTest('product-sort-container').select('Name (Z to A)')
    cy.getDataTest('inventory-item-name').then($names =>{
    const nameArray = $names.toArray().map(el => el.innerText)
    const sortedNames = [...nameArray].sort().reverse()
    expect(nameArray).to.deep.equal(sortedNames) 
    })
  })

  it('Should sort products by price from low to high', () => {
    cy.getDataTest('product-sort-container').select('Price (low to high)')
    cy.getDataTest('inventory-item-price').then($prices =>{
      const pricesArray = $prices.toArray().map(el => parseFloat(el.innerText.replace('$', '')))
      const sortedPrice = [...pricesArray].sort((a, b) => a - b)
      expect(pricesArray).to.deep.equal(sortedPrice)
    })
  })

  it('Should sort products by price from high to low', () => {
    cy.getDataTest('product-sort-container').select('Price (high to low)')
    cy.getDataTest('inventory-item-price').then($prices =>{
      const pricesArray = $prices.toArray().map(el => parseFloat(el.innerText.replace('$', '')))
      const sortedPrice = [...pricesArray].sort((a, b) => a - b).reverse()
      expect(pricesArray).to.deep.equal(sortedPrice)
    })
  })

})



describe('Inventory Page - Product Navigation', () => {
  beforeEach(function(){
  loadFixtures.call(this)
  cy.loginAndVisitInventoryPage()
  })

  it('Should open correct product details when clicking image or title', function() {
    const products = this.products
    Object.values(products).forEach(productDetails => {
    cy.verifyProductDetails(productDetails)
    })
  })

})

describe('Inventory Page - Cart Functionality', () => {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitInventoryPage()
  })


  it('Should allow adding a single item to cart', function() {
    cy.addToCart(this.products.backpack)
    cy.getDataTest('shopping-cart-badge').should('have.text', '1')
  })

  it('Should allow removing an item from the cart', function() {
    cy.addToCart(this.products.backpack)
    cy.getDataTest('shopping-cart-badge').should('have.text', '1')
    cy.getDataTest('remove-sauce-labs-backpack').click()
    cy.getDataTest('shopping-cart-badge').should('not.exist')
  })

  it('Should correctly update cart badge when all products are added', function() {
    const products = this.products
    let count = []

    Object.values(products).forEach(product => {
      cy.addToCart(product)
      count.push(product)
      cy.getDataTest('shopping-cart-badge').should('have.text', count.length)
    })
  })

  it('Should retain cart state while navigating between pages', function() {
    const productstoCart = this.products
    let count = []

    Object.values(productstoCart).forEach(product => {
      cy.addToCartInside(product)
      count.push(product)
      cy.getDataTest('shopping-cart-badge').should('have.text', count.length)
    })
  })

  it('Should preserve cart items after logout and re-login', function(){
    cy.addToCart(this.products.backpack)
    cy.addToCart(this.products.bikeLight)
    cy.getDataTest('shopping-cart-badge').should('have.text', '2')
    cy.assertLogOut()
    cy.logInAsStandardUser()
    cy.getDataTest('shopping-cart-badge').should('have.text', '2')
  })

})

describe('Inventory Page - UI Consistency & Visual Consistency', () => {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitInventoryPage()
  })

  it('Should display header elements properly (cart, menu, logo)', () => {
    cy.getDataTest('shopping-cart-link').should('be.visible') 
    cy.get('.bm-burger-button').should('be.visible')
    cy.get('.app_logo').should('be.visible')
  })

  it('Should display correct product images and alt text', function() {
    const productsImage = this.products

    Object.values(productsImage).forEach(product => {
      cy.contains('[data-test="inventory-item-name"]', product.name)
        .parents('[data-test="inventory-item"]')
        .within(() => {
          cy.get('img').should('have.attr', 'alt', product.name).and('have.attr', 'src').and('include', product.image) 
        })
    })
  })

})









