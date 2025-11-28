// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })



//--------------------ELEMENT SELECTOR------------------------------

//Custom command to select DOM elements using the `data-test` attribute.
Cypress.Commands.add('getDataTest', (dataTestSelector) => {
  return cy.get(`[data-test="${dataTestSelector}"]`)
})





//--------------------ACTIONS------------------------------

//Custom command to perform a quick login using username and password fields.
Cypress.Commands.add('logIn', (username, password) => {
  cy.getDataTest('username').clear().type(username)
  cy.getDataTest('password').clear().type(password)
  cy.getDataTest('login-button').click()
})


Cypress.Commands.add('openHamburgerMenu', () => {
  cy.get('.bm-burger-button').click()
})


Cypress.Commands.add('logInAsStandardUser', () => {
  cy.fixture('users').then(users => {
  cy.getDataTest('username').type(users.validUser.username)
  cy.getDataTest('password').type(users.validUser.password)
  cy.getDataTest('login-button').click()
      
  })
})


Cypress.Commands.add('assertLogOut', () => {
  cy.openHamburgerMenu()
  cy.getDataTest('logout-sidebar-link').should('be.visible').click()
  cy.assertUrlIncludes('/')
  cy.getDataTest('login-button').should('be.visible')
})


Cypress.Commands.add('verifyProductDetails', (productDetails) => {
  cy.contains('[data-test="inventory-item-name"]', productDetails.name).first().click()

  // Verify you navigated correctly
  cy.url().should('include', 'inventory-item.html')

  // Check product details on product page
  cy.getDataTest('inventory-item-name').should('have.text', productDetails.name)
  cy.getDataTest('inventory-item-desc').should('include.text', productDetails.desc)
  cy.getDataTest('inventory-item-price').should('contain.text', productDetails.price)

  cy.getDataTest('back-to-products').click()
})


Cypress.Commands.add('addToCart', (productToAdd) => {
  cy.getDataTest(`add-to-cart-${productToAdd.cart}`).click()
  cy.getDataTest(`remove-${productToAdd.cart}`).should('be.visible')
  cy.getDataTest(`remove-${productToAdd.cart}`).should('have.text', 'Remove')

})


Cypress.Commands.add('addToCartInside', (product) => {
  cy.getDataTest('inventory-item-name').contains(product.name).click()
  cy.getDataTest('add-to-cart').click()
  cy.getDataTest('back-to-products').click()
})


Cypress.Commands.add('loginAndVisitInventoryPage', () => {
  cy.visit('/')
  cy.logInAsStandardUser()
  cy.assertInventoryPageLoaded()
})

Cypress.Commands.add('loginAndVisitCartPage', () => {
  cy.loginAndVisitInventoryPage()
  cy.getDataTest('shopping-cart-link').click()
})

Cypress.Commands.add('loginAndVisitCheckOutPage', () => {
  cy.loginAndVisitCartPage()
  cy.getDataTest('checkout').click()
})

Cypress.Commands.add('loginAndVisitCheckOutOverviewPage', () => {
  cy.loginAndVisitCheckOutPage()
  cy.completeCheckOutForm()
})

Cypress.Commands.add('loginAndVisitCheckOutCompletePage', () => {
  cy.loginAndVisitCheckOutOverviewPage()
  cy.getDataTest('finish').click()
})

Cypress.Commands.add('fillCheckoutForm', ({ firstName, lastName, postalCode }) => {
  if (firstName !== undefined) cy.getDataTest('firstName').type(firstName)
  if (lastName !== undefined) cy.getDataTest('lastName').type(lastName)
  if (postalCode !== undefined) cy.getDataTest('postalCode').type(postalCode)
})


Cypress.Commands.add('note', (msg) => {
  cy.log(`NOTE: ${msg}`)
})


Cypress.Commands.add('itemCheckOut', (itemToCheckout) => {
    cy.getDataTest(`add-to-cart-${itemToCheckout}`).click()
    cy.getDataTest('shopping-cart-link').click()
    cy.getDataTest('checkout').click()
})

Cypress.Commands.add('completeCheckOutForm', () => {
  cy.getDataTest('firstName').type('Test')
  cy.getDataTest('lastName').type('User')
  cy.getDataTest('postalCode').type('1234')
  cy.getDataTest('continue').click()
})

Cypress.Commands.add('addItemsToCart', (itemsArray) => {
  itemsArray.forEach(item => {
    cy.getDataTest(`add-to-cart-${item.cart}`).click()
  })
  cy.getDataTest('shopping-cart-link').click()
})


//--------------------ASSERTIONS------------------------------


//Custom command to assert that the current URL includes a given path.
Cypress.Commands.add('assertUrlIncludes', (path) => {
  cy.url().should('include', path)
})

//Assumes the error message is inside an element with `data-test="error"`
Cypress.Commands.add('assertError', (errorMessage) =>{
  cy.getDataTest('error').should('contain', errorMessage)
})


Cypress.Commands.add('assertPage', (pageTitle, path) => {
  cy.getDataTest('title').should('contain', pageTitle)
  cy.assertUrlIncludes(path)
})

Cypress.Commands.add('assertInventoryPageLoaded', () => {
    cy.getDataTest('product-sort-container').should('be.visible')
    cy.getDataTest('shopping-cart-link').should('be.visible')
    cy.assertPage('Products', '/inventory.html')
})

Cypress.Commands.add('assertCartPageLoaded', () => {
    cy.getDataTest('checkout').should('be.visible')
    cy.getDataTest('continue-shopping').should('be.visible')
    cy.assertPage('Your Cart', '/cart.html')
})

Cypress.Commands.add('assertProductCard', ($product) => {
  cy.wrap($product).within(() => {
    cy.getDataTest('inventory-item-name').should('be.visible')
    cy.getDataTest('inventory-item-desc').should('be.visible')
    cy.getDataTest('inventory-item-price').should('be.visible')
    cy.get('button').should('contain.text', 'Add to cart')
    cy.get('img').should('be.visible')
    })
})

Cypress.Commands.add('errorIconCheck', (errorIconCheck) => {
  cy.getDataTest('continue').click()
  cy.getDataTest(errorIconCheck).parent().find('.error_icon').should('be.visible')
})







