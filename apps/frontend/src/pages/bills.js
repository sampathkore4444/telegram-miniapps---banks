/**
 * Bills Payment Page
 * Utility bill payments and reminders
 */

const BillsPage = {
  /**
   * Render bills page
   * @param {object} params - Page parameters
   * @param {function} callback - Callback to render HTML
   */
  render(params, callback) {
    const html = `
            ${this.renderBillsSummary()}
            ${this.renderUpcomingBills()}
            ${this.renderBillCategories()}
            ${this.renderPaymentHistory()}
        `;

    callback(html);
    this.bindEvents();
  },

  /**
   * Render bills summary
   * @returns {string}
   */
  renderBillsSummary() {
    return `
            <div class="card">
                <div class="bills-summary">
                    <div class="summary-item">
                        <div class="summary-label">Total Due</div>
                        <div class="summary-value">$145.50</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Due This Month</div>
                        <div class="summary-value">3 bills</div>
                    </div>
                </div>
            </div>
        `;
  },

  /**
   * Render upcoming bills
   * @returns {string}
   */
  renderUpcomingBills() {
    const bills = [
      {
        id: 1,
        name: "Electricity",
        provider: "EDC",
        amount: 45.5,
        dueDate: "Apr 25, 2026",
        icon: "zap",
        urgent: true,
      },
      {
        id: 2,
        name: "Water",
        provider: "PPWSA",
        amount: 25.0,
        dueDate: "Apr 28, 2026",
        icon: "droplet",
        urgent: false,
      },
      {
        id: 3,
        name: "Internet",
        provider: "Smart Axiata",
        amount: 35.0,
        dueDate: "Apr 30, 2026",
        icon: "wifi",
        urgent: false,
      },
      {
        id: 4,
        name: "Phone",
        provider: "Cellcard",
        amount: 15.0,
        dueDate: "May 5, 2026",
        icon: "phone",
        urgent: false,
      },
      {
        id: 5,
        name: "School Fees",
        provider: "International School",
        amount: 500.0,
        dueDate: "May 15, 2026",
        icon: "book",
        urgent: false,
      },
    ];

    return `
            <div class="card mt-lg">
                <h4 class="mb-md">Upcoming Bills</h4>
                <div class="bills-list">
                    ${bills
                      .map(
                        (bill) => `
                        <div class="bill-item" data-id="${bill.id}">
                            <div class="bill-icon" style="background-color: ${this.getBillColor(bill.icon)}20; color: ${this.getBillColor(bill.icon)}">
                                ${this.getBillIcon(bill.icon)}
                            </div>
                            <div class="bill-info">
                                <div class="bill-name">${bill.name}</div>
                                <div class="bill-provider">${bill.provider} • Due ${bill.dueDate}</div>
                            </div>
                            <div class="bill-amount">
                                <div class="amount">$${bill.amount.toFixed(2)}</div>
                                ${bill.urgent ? '<span class="badge badge-error">Due Soon</span>' : ""}
                            </div>
                            <button class="btn btn-sm btn-primary pay-btn" data-id="${bill.id}">Pay</button>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `;
  },

  /**
   * Render bill categories
   * @returns {string}
   */
  renderBillCategories() {
    const categories = [
      { name: "Electricity", icon: "zap", count: 12 },
      { name: "Water", icon: "droplet", count: 8 },
      { name: "Internet", icon: "wifi", count: 15 },
      { name: "Phone", icon: "phone", count: 6 },
      { name: "Insurance", icon: "shield", count: 3 },
      { name: "Loans", icon: "credit-card", count: 5 },
    ];

    return `
            <div class="card mt-lg">
                <h4 class="mb-md">Bill Categories</h4>
                <div class="categories-grid">
                    ${categories
                      .map(
                        (cat) => `
                        <div class="category-item" data-category="${cat.name.toLowerCase()}">
                            <div class="category-icon">
                                ${this.getBillIcon(cat.icon)}
                            </div>
                            <span class="category-name">${cat.name}</span>
                            <span class="category-count">${cat.count}</span>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `;
  },

  /**
   * Render payment history
   * @returns {string}
   */
  renderPaymentHistory() {
    const history = [
      {
        name: "Electricity",
        amount: 42.5,
        date: "Mar 15, 2026",
        status: "paid",
      },
      { name: "Internet", amount: 35.0, date: "Mar 10, 2026", status: "paid" },
      { name: "Water", amount: 22.0, date: "Feb 28, 2026", status: "paid" },
    ];

    return `
            <div class="card mt-lg">
                <div class="card-header">
                    <h4>Payment History</h4>
                    <button class="btn btn-ghost btn-sm">View All</button>
                </div>
                <div class="history-list">
                    ${history
                      .map(
                        (item) => `
                        <div class="history-item">
                            <div class="history-info">
                                <strong>${item.name}</strong>
                                <span class="text-muted">${item.date}</span>
                            </div>
                            <div class="history-amount">
                                <span>$${item.amount.toFixed(2)}</span>
                                <span class="badge badge-success">Paid</span>
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
   * Get bill icon SVG
   * @param {string} icon - Icon name
   * @returns {string}
   */
  getBillIcon(icon) {
    const icons = {
      zap: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
      droplet:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
      wifi: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
      phone:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
      book: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
      shield:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      "credit-card":
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    };
    return icons[icon] || icons["credit-card"];
  },

  /**
   * Get bill color
   * @param {string} icon - Icon name
   * @returns {string}
   */
  getBillColor(icon) {
    const colors = {
      zap: "#F39C12",
      droplet: "#3498DB",
      wifi: "#9B59B6",
      phone: "#27AE60",
      book: "#E74C3C",
      shield: "#1ABC9C",
    };
    return colors[icon] || "#2481CC";
  },

  /**
   * Bind page events
   */
  bindEvents() {
    // Pay buttons
    document.querySelectorAll(".pay-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const billId = btn.dataset.id;
        this.payBill(billId);
      });
    });

    // Bill items
    document.querySelectorAll(".bill-item").forEach((item) => {
      item.addEventListener("click", () => {
        const billId = item.dataset.id;
        this.showBillDetails(billId);
      });
    });

    // Categories
    document.querySelectorAll(".category-item").forEach((cat) => {
      cat.addEventListener("click", () => {
        const category = cat.dataset.category;
        window.showToast(`Showing ${category} bills...`, "info");
      });
    });
  },

  /**
   * Pay bill
   * @param {string} billId - Bill ID
   */
  payBill(billId) {
    window.showToast("Processing payment...", "info");

    // Simulate payment
    setTimeout(() => {
      window.showToast("Payment successful!", "success");
    }, 2000);
  },

  /**
   * Show bill details
   * @param {string} billId - Bill ID
   */
  showBillDetails(billId) {
    window.showToast("Bill details coming soon", "info");
  },
};

// Export
window.BillsPage = BillsPage;
