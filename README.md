# 🛒 Cypress E2E Automation Framework

**Target Application:** [Sauce Demo (Swag Labs)](https://www.saucedemo.com/)
**Type:** End-to-End (E2E) Web Automation
**Author:** Rainniel Irish Dilag

## 🏗️ Project Architecture
This framework uses a **modular test structure** to handle complex user flows. I separated the Checkout process into distinct spec files to ensure easier debugging and independent execution.

| Feature Module | Spec File | Description |
| :--- | :--- | :--- |
| **Authentication** | `login.cy.js` | Validates Standard, Locked-Out, and Invalid users. |
| **Inventory** | `inventory.cy.js` | Tests product sorting (A-Z, Low-High) and cart badge logic. |
| **Cart Management** | `cart.cy.js` | Verifies item retention and removal functionalities. |
| **Checkout Step 1** | `checkOutStepOne.cy.js` | **Input Validation:** Tests form constraints (Zip Code, Name). |
| **Checkout Step 2** | `checkOutStepTwo.cy.js` | **Data Validation:** Verifies item prices and tax calculations. |
| **Checkout Step 3** | `checkOutStepThree.cy.js` | **Completion:** Validates the final order confirmation and redirect. |

---

## 💾 Data-Driven Testing (Fixtures)
Instead of hard-coding values, this framework uses the `cypress/fixtures/` folder to load test data dynamically.

* `users.json`: Contains all valid and invalid test credentials.
* `products.json`: Stores expected product names and prices for validation.
* `checkOutError.json`: Stores expected error messages for form validation tests.
* `errors.json`: Global error message repository.

---

## 🛠️ Custom Utilities & Commands
To adhere to **DRY (Don't Repeat Yourself)** principles, I implemented reusable logic:

* **`cypress/support/commands.js`**: Contains the custom `cy.login()` command to standardize authentication across all tests.
* **`cypress/support/utils.js`**: Helper functions for parsing price strings (e.g., converting "$29.99" to `29.99` for math assertions).

---

## 🚀 How to Run the Tests

### 1. Prerequisites
Ensure you have **Node.js** (v14+) and **Git** installed on your machine.

### 2. Installation
Run these commands to clone the project and install all dependencies:

```bash
# Clone repo, enter folder, and install Cypress
git clone [https://github.com/rainniel-dilag/cypress-automation-portfolio.git](https://github.com/rainniel-dilag/cypress-automation-portfolio.git)
cd cypress-automation-portfolio
npm install

Execution Commands
You can run the tests using any of the following commands:
# Option A: Open Test Runner (Visual Mode)
npx cypress open

# Option B: Run Headless Mode (Generates terminal report)
npx cypress run

# Option C: Run Specific Suites (e.g., only Checkout flow)
npx cypress run --spec "cypress/e2e/checkout/**/*.cy.js"

