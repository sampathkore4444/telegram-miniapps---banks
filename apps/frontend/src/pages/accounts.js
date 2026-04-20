/**
 * Accounts Page
 * Displays user accounts and transactions
 */

const AccountsPage = {
  /**
   * Render accounts page
   * @param {object} params - Page parameters
   * @param {function} callback - Callback to render HTML
   */
  render(params, callback) {
    const accounts = store.get("accounts");

    const html = `
            ${this.renderAccountsList(accounts)}
        `;

    callback(html);
    this.bindEvents();
  },

  /**
   * Render accounts list
   * @param {array} accounts - Accounts array
   * @returns {string}
   */
  renderAccountsList(accounts) {
    // Mock data if no accounts
    const mockAccounts =
      accounts.length > 0 ? accounts : this.getMockAccounts();

    return `
            <div class="accounts-list">
                ${mockAccounts
                  .map(
                    (account) => `
                    <div class="card account-card" data-account-id="${account.id}">
                        <div class="account-header">
                            <div>
                                <div class="account-type">${account.type}</div>
                                <div class="account-number">•••• ${account.number}</div>
                            </div>
                            <div class="badge ${account.is_primary ? "badge-success" : "badge-info"}">
                                ${account.is_primary ? "Primary" : "Secondary"}
                            </div>
                        </div>
                        <div class="account-balance">
                            <div class="balance-label">Available Balance</div>
                            <div class="balance-amount">$${this.formatNumber(account.balance)}</div>
                        </div>
                        <div class="account-actions">
                            <button class="btn btn-outline btn-block" data-action="view" data-account-id="${account.id}">
                                View Details
                            </button>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            ${this.renderAddAccountButton()}
        `;
  },

  /**
   * Render add account button
   * @returns {string}
   */
  renderAddAccountButton() {
    return `
            <div class="card mt-lg">
                <button class="btn btn-primary btn-block" id="addAccountBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Open New Account
                </button>
            </div>
        `;
  },

  /**
   * Get mock accounts
   * @returns {array}
   */
  getMockAccounts() {
    return [
      {
        id: "1",
        type: "Savings Account",
        number: "4532",
        balance: 5240.5,
        is_primary: true,
      },
      {
        id: "2",
        type: "Checking Account",
        number: "8821",
        balance: 1250.0,
        is_primary: false,
      },
    ];
  },

  /**
   * Format number
   * @param {number} num - Number to format
   * @returns {string}
   */
  formatNumber(num) {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  },

  /**
   * Bind page events
   */
  bindEvents() {
    // View account details
    document.querySelectorAll('[data-action="view"]').forEach((el) => {
      el.addEventListener("click", (e) => {
        const accountId = el.dataset.accountId;
        this.viewAccountDetails(accountId);
      });
    });

    // Add account button
    const addBtn = document.getElementById("addAccountBtn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        window.showToast("Account opening coming soon", "info");
      });
    }
  },

  /**
   * View account details
   * @param {string} accountId - Account ID
   */
  viewAccountDetails(accountId) {
    window.showToast("Account details coming soon", "info");
  },
};

// Export for use in other modules
window.AccountsPage = AccountsPage;
