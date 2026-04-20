/**
 * Wallet Page
 * User wallet and rewards
 */

const WalletPage = {
  /**
   * Render wallet page
   * @param {object} params - Page parameters
   * @param {function} callback - Callback to render HTML
   */
  render(params, callback) {
    const wallet = store.get("wallet");

    const html = `
            ${this.renderWalletCard(wallet)}
            ${this.renderTransactions()}
            ${this.renderActions()}
        `;

    callback(html);
    this.bindEvents();
  },

  /**
   * Render wallet card
   * @param {object} wallet - Wallet data
   * @returns {string}
   */
  renderWalletCard(wallet) {
    const balance = wallet?.balance || 125.5;

    return `
            <div class="balance-card">
                <div class="balance-label">My Wallet</div>
                <div class="balance-amount">$${this.formatNumber(balance)}</div>
                <div class="balance-account">Available Balance</div>
            </div>
        `;
  },

  /**
   * Render transactions
   * @returns {string}
   */
  renderTransactions() {
    const transactions = [
      { title: "Referral Bonus", date: "Mar 15, 2026", amount: 25, type: "in" },
      {
        title: "Cashback - Grocery",
        date: "Mar 12, 2026",
        amount: 1.5,
        type: "in",
      },
      { title: "Transfer Out", date: "Mar 10, 2026", amount: 20, type: "out" },
      { title: "Welcome Bonus", date: "Mar 1, 2026", amount: 10, type: "in" },
    ];

    return `
            <div class="card mt-lg">
                <div class="card-header">
                    <h3 class="card-title">Transaction History</h3>
                </div>
                <div class="transaction-list">
                    ${transactions
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
                      .join("")}
                </div>
            </div>
        `;
  },

  /**
   * Render actions
   * @returns {string}
   */
  renderActions() {
    return `
            <div class="mt-lg">
                <button class="btn btn-outline btn-block" id="withdrawBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <path d="M19 12l-7 7-7-7"/>
                    </svg>
                    Withdraw to Bank Account
                </button>
            </div>
        `;
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
    const withdrawBtn = document.getElementById("withdrawBtn");
    if (withdrawBtn) {
      withdrawBtn.addEventListener("click", () => {
        window.showToast("Withdrawal feature coming soon", "info");
      });
    }
  },
};

// Export for use in other modules
window.WalletPage = WalletPage;
