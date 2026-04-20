/**
 * Loans Page
 * Displays user loans and loan applications
 */

const LoansPage = {
  /**
   * Render loans page
   * @param {object} params - Page parameters
   * @param {function} callback - Callback to render HTML
   */
  render(params, callback) {
    const loans = store.get("loans");

    const html = `
            ${this.renderLoansHeader()}
            ${this.renderLoansList(loans)}
            ${this.renderApplyButton()}
        `;

    callback(html);
    this.bindEvents();
  },

  /**
   * Render loans header
   * @returns {string}
   */
  renderLoansHeader() {
    return `
            <div class="card">
                <div class="text-center">
                    <div class="text-muted mb-sm">Total Outstanding</div>
                    <div class="balance-amount text-primary">$2,500.00</div>
                </div>
            </div>
        `;
  },

  /**
   * Render loans list
   * @param {array} loans - Loans array
   * @returns {string}
   */
  renderLoansList(loans) {
    // Mock data if no loans
    const mockLoans = loans.length > 0 ? loans : this.getMockLoans();

    if (mockLoans.length === 0) {
      return `
                <div class="card">
                    <div class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        <h3 class="empty-state-title">No Active Loans</h3>
                        <p class="empty-state-text">Apply for a loan to get started</p>
                    </div>
                </div>
            `;
    }

    return `
            <div class="loans-list">
                ${mockLoans
                  .map(
                    (loan) => `
                    <div class="loan-card" data-loan-id="${loan.id}">
                        <div class="loan-header">
                            <div>
                                <div class="loan-type">${loan.type}</div>
                                <div class="loan-id">Loan #${loan.id}</div>
                            </div>
                            <div class="badge ${this.getStatusClass(loan.status)}">
                                ${loan.status}
                            </div>
                        </div>
                        <div class="loan-amount">$${this.formatNumber(loan.amount)}</div>
                        <div class="loan-details">
                            <div class="loan-detail">
                                <span class="loan-detail-label">Interest Rate</span>
                                <span class="loan-detail-value">${loan.interest_rate}%</span>
                            </div>
                            <div class="loan-detail">
                                <span class="loan-detail-label">Monthly Payment</span>
                                <span class="loan-detail-value">$${this.formatNumber(loan.monthly_payment)}</span>
                            </div>
                            <div class="loan-detail">
                                <span class="loan-detail-label">Remaining</span>
                                <span class="loan-detail-value">$${this.formatNumber(loan.remaining)}</span>
                            </div>
                            <div class="loan-detail">
                                <span class="loan-detail-label">Next Due</span>
                                <span class="loan-detail-value">${loan.next_due}</span>
                            </div>
                        </div>
                        <div class="progress-bar mt-md">
                            <div class="progress-fill" style="width: ${loan.progress}%"></div>
                        </div>
                        <div class="text-center mt-sm text-muted">
                            ${loan.progress}% paid
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `;
  },

  /**
   * Get status badge class
   * @param {string} status - Loan status
   * @returns {string}
   */
  getStatusClass(status) {
    const statusMap = {
      active: "badge-success",
      pending: "badge-warning",
      paid: "badge-info",
      default: "badge-error",
    };
    return statusMap[status?.toLowerCase()] || "badge-info";
  },

  /**
   * Render apply button
   * @returns {string}
   */
  renderApplyButton() {
    return `
            <div class="mt-lg">
                <button class="btn btn-primary btn-block" id="applyLoanBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Apply for New Loan
                </button>
            </div>
        `;
  },

  /**
   * Get mock loans
   * @returns {array}
   */
  getMockLoans() {
    return [
      {
        id: "LN001",
        type: "Personal Loan",
        amount: 5000,
        remaining: 2500,
        interest_rate: 12,
        monthly_payment: 220,
        status: "active",
        progress: 50,
        next_due: "Apr 25, 2026",
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
    // Apply loan button
    const applyBtn = document.getElementById("applyLoanBtn");
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        store.setCurrentPage("eligibility");
      });
    }

    // Loan card click
    document.querySelectorAll("[data-loan-id]").forEach((el) => {
      el.addEventListener("click", () => {
        const loanId = el.dataset.loanId;
        window.showToast(`Loan #${loanId} details coming soon`, "info");
      });
    });
  },
};

// Export for use in other modules
window.LoansPage = LoansPage;
