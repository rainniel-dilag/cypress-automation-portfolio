const loadFixtures = function() {
  cy.fixture('users').as('users')
  cy.fixture('errors').as('errors')
}

describe('Login Page - Standard Flow', () => {
  beforeEach(function() {
    loadFixtures.call(this)
    cy.visit('/')
  })

  it('Successfully logs in with valid standard user credentials', function() {
    cy.logIn(this.users.validUser.username, this.users.validUser.password)
    cy.assertPage('Products', '/inventory.html')
  })

  it('Displays error when logging in with invalid username and password', function() {
    cy.logIn(this.users.invalidUser.username, this.users.invalidUser.password)
    cy.assertError(this.errors.invalidCredentials)
    cy.assertUrlIncludes('/')
  })

  it('Displays error when locked-out user attempts to log in', function() {
    cy.logIn(this.users.lockedOutUser.username, this.users.lockedOutUser.password)
    cy.assertError(this.errors.lockedOutUser)
    cy.assertUrlIncludes('/')
  })
})

describe('Login Page - Input Validation', () => {
  beforeEach(function() {
    loadFixtures.call(this)
    cy.visit('/')
  })

  it('Displays error when only password is provided', function() {
    cy.getDataTest('password').type(this.users.validUser.password)
    cy.getDataTest('login-button').click()
    cy.assertError(this.errors.usernameRequired)
    cy.assertUrlIncludes('/')
  })

  it('Displays error when only username is provided', function() {
    cy.getDataTest('username').type(this.users.validUser.username)
    cy.getDataTest('login-button').click()
    cy.assertError(this.errors.passwordRequired)
    cy.assertUrlIncludes('/')
  })

  it('Displays error when no credentials are provided', function() {
    cy.getDataTest('login-button').click()
    cy.assertError(this.errors.usernameRequired)
    cy.assertUrlIncludes('/')
  })

  it('Rejects login when username/password include whitespace', function() {
    cy.getDataTest('username').type(' standard_user ')
    cy.getDataTest('password').type(' secret_sauce ')
    cy.getDataTest('login-button').click()
    cy.assertError(this.errors.invalidCredentials)
    cy.assertUrlIncludes('/')
  })

  it('Special character handling in login fields', function() {
    cy.getDataTest('username').type('test!@#')
    cy.getDataTest('password').type('pass$%^')
    cy.getDataTest('login-button').click()
    cy.assertError(this.errors.invalidCredentials)
    cy.assertUrlIncludes('/')
  })

  it('Does not allow login with excessively long username and password', () => {
    const longString = 'abc'.repeat(51)
    cy.getDataTest('username').type(longString)
    cy.getDataTest('password').type(longString)
    cy.getDataTest('login-button').click()
  })

  it('Error is cleared on corrected input', function() {
    cy.logIn(this.users.invalidUser.username, this.users.invalidUser.password)
    cy.assertError(this.errors.invalidCredentials)
    cy.assertUrlIncludes('/')
    cy.logIn(this.users.validUser.username, this.users.validUser.password)
    cy.getDataTest('error').should('not.exist')
  })
})

describe('Login Page - Session & Browser Behavior', () => {
  beforeEach(function() {
    loadFixtures.call(this)
    cy.visit('/')
  })

  it('User remains logged in after page reload', function() {
    cy.logIn(this.users.validUser.username, this.users.validUser.password)
    cy.assertPage('Products', '/inventory.html')
    cy.reload()
    cy.assertPage('Products', '/inventory.html')
  })

  it('Maintains session when navigating back and forward', function() {
    cy.logIn(this.users.validUser.username, this.users.validUser.password)
    cy.assertPage('Products', '/inventory.html')
    cy.go('back')
    cy.assertUrlIncludes('/')
    cy.go('forward')
    cy.assertPage('Products', '/inventory.html')
  })

  it('Restricted access after logout when using browser back navigation', function() {
    cy.logIn(this.users.validUser.username, this.users.validUser.password)
    cy.assertPage('Products', '/inventory.html')
    cy.openHamburgerMenu()
    cy.getDataTest('logout-sidebar-link').click()
    cy.assertUrlIncludes('/')
    cy.go('back')
    cy.assertUrlIncludes('/')
    cy.assertError(this.errors.inventoryPageAccessDenied)
  })
})

describe('Login Page - UI + Security Behavior', () => {
  beforeEach(function() {
    loadFixtures.call(this)
    cy.visit('/')
  })

  it('Ensures password input field masks user input', () => {
    cy.getDataTest('password').type('secret_sauce').should('have.attr', 'type', 'password')
    cy.assertUrlIncludes('/')
  })

  it('Redirects to login when trying to access inventory without logging in', function() {
    cy.visit('/inventory.html', {failOnStatusCode: false})
    cy.assertError(this.errors.inventoryPageAccessDenied)
    cy.getDataTest('login-button').should('be.visible')
    cy.assertUrlIncludes('/')
  })

  it('Error icon visibility and close button behavior', () => {
    cy.getDataTest('login-button').click()
    cy.getDataTest('error-button').should('be.visible').click()
  })
})
