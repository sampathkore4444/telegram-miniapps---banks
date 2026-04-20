/**
 * Home Page
 * Main dashboard page after login
 */

const HomePage = {
  /**
   * Render home page
   * @param {object} params - Page parameters
   * @param {function} callback - Callback to render HTML
   */
  render(params, callback) {
    const user = store.get("user");
    const accounts = store.get("accounts");
    const loans = store.get("loans");

    const html = `
            ${this.renderBalanceCard(user, accounts)}
            ${this.renderQuickActions()}
            ${this.renderRecentTransactions()}
        `;

    callback(html);
    this.bindEvents();
  },

  /**
   * Render balance card
   * @param {object} user - User data
   * @param {array} accounts - Accounts array
   * @returns {string}
   */
  renderBalanceCard(user, accounts) {
    const totalBalance = accounts.reduce(
      (sum, acc) => sum + (acc.balance || 0),
      0,
    );
    const mainAccount = accounts.find((acc) => acc.is_primary) || accounts[0];

    return `
            <div class="balance-card">
                <div class="balance-label">Total Balance</div>
                <div class="balance-amount">$${this.formatNumber(totalBalance)}</div>
                ${
                  mainAccount
                    ? `
                    <div class="balance-account">
                        ${mainAccount.account_type || "Account"} ••••${mainAccount.account_number?.slice(-4) || "0000"}
                    </div>
                `
                    : ""
                }
            </div>
        `;
  },

  /**
   * Render quick actions
   * @returns {string}
   */
  renderQuickActions() {
    return `
            <div class="quick-actions">
                <button class="quick-action" data-action="transfer">
                    <div class="quick-action-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 1l4 4-4 4"/>
                            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                            <path d="M7 23l-4-4 4-4"/>
                            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                        </svg>
                    </div>
                    <span class="quick-action-label">Transfer</span>
                </button>
                <button class="quick-action" data-action="scan">
                    <div class="quick-action-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <line x1="7" y1="8" x2="17" y2="8"/>
                            <line x1="7" y1="12" x2="17" y2="12"/>
                            <line x1="7" y1="16" x2="13" y2="16"/>
                        </svg>
                    </div>
                    <span class="quick-action-label">Scan QR</span>
                </button>
                <button class="quick-action" data-action="topup">
                    <div class="quick-action-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                            <line x1="12" y1="8" x2="12" y2="16"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                    </div>
                    <span class="quick-action-label">Top Up</span>
                </button>
                <button class="quick-action" data-action="bills">
                    <div class="quick-action-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                    </div>
                    <span class="quick-action-label">Bills</span>
                </button>
            </div>
        `;
  },

  /**
   * Render recent transactions
   * @returns {string}
   */
  renderRecentTransactions() {
    const transactions = this.getMockTransactions();

    return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Recent Transactions</h3>
                    <button class="btn btn-ghost" data-page="accounts">View All</button>
                </div>
                <div class="transaction-list">
                    ${
                      transactions.length > 0
                        ? transactions
                            .map(
                              (tx) => `
                        <div class="transaction-item">
                            <div class="transaction-info">
                                <div class="transaction-icon" style="background-color: ${tx.type === "in" ? "rgba(39, 174, 96, 0.1)" : "rgba(231, 76, 60, 0.1)"}">
                                    ${
                                      tx.type === "in"
                                        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#27AE60" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'
                                        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>'
                                    }
                                </div>
                                <div class="transaction-details">
                                    <h4>${tx.title}</h4>
                                    <p>${tx.date}</p>
                                </div>
                            </div>
                            <div class="transaction-amount ${tx.type === "in" ? "positive" : "negative"}">
                                ${tx.type === "in" ? "+" : "-"}$${this.formatNumber(tx.amount)}
                            </div>
                        </div>
                    `,
                            )
                            .join("")
                        : `
                        <div class="empty-state">
                            <p class="text-muted">No recent transactions</p>
                        </div>
                    `
                    }
                </div>
            </div>
        `;
  },

  /**
   * Get mock transactions
   * @returns {array}
   */
  getMockTransactions() {
    return [
      {
        title: "Received from John",
        date: "Today, 2:30 PM",
        amount: 150,
        type: "in",
      },
      {
        title: "Coffee Shop",
        date: "Today, 11:00 AM",
        amount: 5.5,
        type: "out",
      },
      { title: "Grocery Store", date: "Yesterday", amount: 45.0, type: "out" },
      { title: "Salary Deposit", date: "Mar 15", amount: 2500, type: "in" },
    ];
  },

  /**
   * Format number with commas
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
    // Quick action clicks
    document.querySelectorAll(".quick-action").forEach((el) => {
      el.addEventListener("click", (e) => {
        const action = el.dataset.action;
        this.handleAction(action);
      });
    });

    // View all button
    document.querySelectorAll("[data-page]").forEach((el) => {
      el.addEventListener("click", (e) => {
        const page = el.dataset.page;
        store.setCurrentPage(page);
      });
    });
  },

  /**
   * Handle quick action
   * @param {string} action - Action name
   */
  handleAction(action) {
    switch (action) {
      case "transfer":
        window.showToast("Transfer feature coming soon", "info");
        break;
      case "scan":
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.openScanQrPopup();
        }
        break;
      case "topup":
        window.showToast("Top up feature coming soon", "info");
        break;
      case "bills":
        window.showToast("Bills feature coming soon", "info");
        break;
    }
  },
};

// Export for use in other modules
window.HomePage = HomePage;
