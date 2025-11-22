import { loadFixtures } from "../support/utils";

describe('Cart Page - Access & Navigation Tests', () => {
  beforeEach(function(){
    loadFixtures.call(this)
  })

  it('Should open cart page using the cart icon', () => {
    cy.loginAndVisitCartPage()
    cy.assertCartPageLoaded()
  })

  it('Should block direct access when user is not logged in', function() {
    cy.visit('/cart.html', {failOnStatusCode: false})
    cy.assertError(this.errors.cartPageAccessDenied)
    cy.getDataTest('login-button').should('be.visible')
  })

  it('Should display correct page title and URL', () => {
    cy.loginAndVisitCartPage()
    cy.assertCartPageLoaded()
  })

})

describe('Cart Page - Add & Remove Item Behavior', () => {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitInventoryPage()
  })

  it('Should show added product inside the cart list', function() {
    cy.getDataTest('add-to-cart-sauce-labs-backpack').click()
    cy.getDataTest('shopping-cart-link').click()
    cy.assertCartPageLoaded()
    cy.getDataTest('shopping-cart-badge').should('have.length', 1)
    cy.get('.cart_item_label').within(() => {
      cy.getDataTest('item-4-title-link').should('contain', this.products.backpack.name)
      cy.getDataTest('inventory-item-desc').should('contain', this.products.backpack.desc)
      cy.getDataTest('inventory-item-price').should('contain', this.products.backpack.price)
    })
  })

  it('Should display all selected items in the cart', function() {
    const selectedProducts = [this.products.backpack, this.products.bikeLight, this.products.tShirt]

    let count = []

    selectedProducts.forEach(productToAdd => {
      count.push(productToAdd)
      cy.getDataTest(`add-to-cart-${productToAdd.cart}`).click()
      cy.getDataTest('shopping-cart-badge').should('have.text', count.length)
    })

    cy.getDataTest('shopping-cart-link').click()

    selectedProducts.forEach(productDetails => {
    cy.get('.cart_item_label').should('contain', productDetails.name)
    })
    cy.getDataTest('shopping-cart-badge').should('have.text', count.length)

  })

  it('Should update cart count after removing an item', function() {
    
    const selectedProducts = [this.products.backpack, this.products.bikeLight, this.products.tShirt]

    let count = []

    selectedProducts.forEach(productsToAdd => {
      cy.getDataTest(`add-to-cart-${productsToAdd.cart}`).click()
      count.push(productsToAdd)
      cy.getDataTest('shopping-cart-badge').should('contain', count.length)
    })

    cy.getDataTest('shopping-cart-link').click()

    const productsToRemove = [this.products.backpack, this.products.bikeLight];

    productsToRemove.forEach(product => {
      cy.getDataTest(`remove-${product.cart}`).click()
      count = count.filter(item => item.cart !== product.cart)
      cy.getDataTest('shopping-cart-badge').should('have.text', count.length)
    })
    
    cy.get('.cart_item_label').each($item => {
      cy.wrap($item).within(() =>{
        cy.getDataTest('inventory-item-name').should('not.contain', this.products.backpack.cart).and('not.contain', this.products.bikeLight.cart)
      })
    })

  })

  it('Should empty cart after removing all items', function() {
    const addAllProducts = this.products
    let count = []

    Object.values(addAllProducts).forEach(product => {
      cy.getDataTest(`add-to-cart-${product.cart}`).click()
      count.push(product)
      cy.getDataTest('shopping-cart-badge').should('contain', count.length)    
    })

    cy.getDataTest('shopping-cart-link').click()

     Object.values(addAllProducts).forEach(product => {
      cy.get('.cart_item_label').first().within(() => {
        cy.getDataTest(`remove-${product.cart}`).click()
      })
      
      count = count.filter(item => item.cart !== product.cart)
      
    })

    if (count.length > 0){
      cy.getDataTest('shopping-cart-badge').should('contain', count.length) 
    } else{
      cy.getDataTest('shopping-cart-badge').should('not.exist') 
    }
  })

  it('Should return to inventory when clicking Continue Shopping', () => {
    cy.getDataTest('add-to-cart-sauce-labs-backpack').click()
    cy.getDataTest('shopping-cart-link').click()
    cy.getDataTest('continue-shopping').click()
    cy.assertPage('Products', '/inventory.html')
  })

  it('Should go to Checkout information page when clicking Checkout', () => {
    cy.getDataTest('add-to-cart-sauce-labs-backpack').click()
    cy.getDataTest('shopping-cart-link').click()
    cy.getDataTest('checkout').click()
    cy.assertPage('Checkout: Your Information', '/checkout-step-one.html')
  })


})

describe('Cart Page - Data Accuracy & Validation', function() {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitInventoryPage()

  })

  beforeEach(function(){
    const allProducts = this.products
    let itemCount = 0
    Object.values(allProducts).forEach(product => {
      cy.getDataTest(`add-to-cart-${product.cart}`).click()
      itemCount++;
      cy.getDataTest('shopping-cart-badge').should('contain.text', itemCount.toString())
    })

    cy.getDataTest('shopping-cart-link').click()
  })

  it('Should match product names with inventory data', function() {
    const allProducts = this.products
    Object.values(allProducts).forEach(productDetails => {
      cy.contains('.cart_item_label', productDetails.name).within(() => {
        cy.getDataTest('inventory-item-name').should('contain.text', productDetails.name)
      })
    })
  })

  it('Should match product prices with inventory data', function() {
    const allProducts = this.products
    Object.values(allProducts).forEach(productPrice => {
      cy.contains('.cart_item_label', productPrice.name).within(() => {
        cy.getDataTest('inventory-item-price').should('contain.text', productPrice.price)
      })
    })

  })

  it('Should match product descriptions with inventory data', function(){
    const allProducts = this.products
    Object.values(allProducts).forEach(productDescription =>{
      cy.contains('.cart_item_label', productDescription.name).within(() => {
        cy.getDataTest('inventory-item-desc').should('contain.text', productDescription.desc)
      })
    })
  })

  it('Should correctly update cart badge count when items change', function() {
    const allProducts = Object.values(this.products)
    let itemCount = Object.values(this.products)

    allProducts.forEach(product => {
      cy.getDataTest(`remove-${product.cart}`).click()
      itemCount = itemCount.filter(item => item.cart !== product.cart)
    })
    
    if (itemCount.length > 0) {
    cy.getDataTest('shopping-cart-badge').should('have.text', itemCount.length)
    } else {
      cy.getDataTest('shopping-cart-badge').should('not.exist')
    }

  })

})

describe('Cart Page - Session and State Management', () => {
  beforeEach(function(){
    loadFixtures.call(this)
    cy.loginAndVisitInventoryPage()
  })

  it('Should keep cart items after page refresh', function() {
    const selectedItems = [this.products.backpack, this.products.bikeLight]

    selectedItems.forEach(product => {
      cy.getDataTest(`add-to-cart-${product.cart}`).click()
    })

    cy.getDataTest('shopping-cart-link').click()

    selectedItems.forEach(productDetails => {
      cy.contains('.cart_item_label', productDetails.name).within(() => {
        cy.getDataTest('inventory-item-name').should('contain.text', productDetails.name)
        cy.getDataTest('inventory-item-desc').should('contain.text', productDetails.desc)
      })
    })

    cy.reload()

    selectedItems.forEach(productDetails => {
      cy.contains('.cart_item_label', productDetails.name).within(() => {
        cy.getDataTest('inventory-item-name').should('contain.text', productDetails.name)
        cy.getDataTest('inventory-item-desc').should('contain.text', productDetails.desc)
      })
    })
  })

  it('Should keep cart items after logout and login', function () {
    const itemCount = []

    cy.addToCart(this.products.backpack)
    itemCount.push(this.products.backpack)
    
    cy.getDataTest('shopping-cart-badge').should('contain.text', itemCount.length)
    cy.assertLogOut()
    cy.loginAndVisitCartPage()
    cy.contains('.cart_item_label', this.products.backpack.name).within(() => {
      cy.getDataTest('inventory-item-name').should('have.text', this.products.backpack.name)
      cy.getDataTest('inventory-item-desc').should('have.text', this.products.backpack.desc)
      cy.getDataTest('inventory-item-price').should('have.text', this.products.backpack.price)
    })
    cy.getDataTest('shopping-cart-badge').should('contain.text', itemCount.length)
  })


})
