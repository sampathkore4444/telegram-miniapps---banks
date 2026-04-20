/**
 * Loan Calculator Page
 * EMI calculator and loan planning tool
 */

const CalculatorPage = {
  /**
   * Render calculator page
   * @param {object} params - Page parameters
   * @param {function} callback - Callback to render HTML
   */
  render(params, callback) {
    const html = `
            ${this.renderCalculator()}
            ${this.renderLoanTypes()}
            ${this.renderAmortizationPreview()}
        `;

    callback(html);
    this.bindEvents();
  },

  /**
   * Render calculator
   * @returns {string}
   */
  renderCalculator() {
    return `
            <div class="card">
                <h3 class="mb-lg">Loan EMI Calculator</h3>
                <form id="calculatorForm">
                    <div class="form-group">
                        <label class="form-label">Loan Amount (USD)</label>
                        <input type="number" class="form-input" id="loanAmount" value="5000" min="100" max="50000">
                        <input type="range" class="range-slider" id="loanAmountSlider" value="5000" min="100" max="50000" step="100">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Loan Term (Months)</label>
                        <select class="form-input" id="loanTerm">
                            <option value="6">6 months</option>
                            <option value="12">12 months</option>
                            <option value="24" selected>24 months</option>
                            <option value="36">36 months</option>
                            <option value="48">48 months</option>
                            <option value="60">60 months</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Interest Rate (% per year)</label>
                        <input type="number" class="form-input" id="interestRate" value="12" min="1" max="30" step="0.5">
                    </div>
                </form>
            </div>
            ${this.renderResults()}
        `;
  },

  /**
   * Render results
   * @returns {string}
   */
  renderResults() {
    const results = this.calculateEMI();

    return `
            <div class="card mt-lg results-card">
                <div class="results-header">
                    <h4>Your Monthly EMI</h4>
                </div>
                <div class="results-main">
                    <div class="emi-amount">$${results.emi.toFixed(2)}</div>
                    <p class="text-muted">per month</p>
                </div>
                <div class="results-grid">
                    <div class="result-item">
                        <div class="result-label">Principal Amount</div>
                        <div class="result-value">$${results.principal.toFixed(2)}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Total Interest</div>
                        <div class="result-value">$${results.totalInterest.toFixed(2)}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Total Payment</div>
                        <div class="result-value">$${results.totalPayment.toFixed(2)}</div>
                    </div>
                </div>
                <button class="btn btn-primary btn-block mt-lg" id="applyNowBtn">
                    Apply for This Loan
                </button>
            </div>
        `;
  },

  /**
   * Render loan types
   * @returns {string}
   */
  renderLoanTypes() {
    const loanTypes = [
      { name: "Personal Loan", rate: "12-18%", max: "$10,000", icon: "user" },
      {
        name: "Business Loan",
        rate: "10-15%",
        max: "$50,000",
        icon: "briefcase",
      },
      { name: "Home Loan", rate: "8-12%", max: "$100,000", icon: "home" },
      { name: "Education Loan", rate: "6-10%", max: "$25,000", icon: "book" },
    ];

    return `
            <div class="card mt-lg">
                <h4 class="mb-md">Compare Loan Types</h4>
                <div class="loan-types-list">
                    ${loanTypes
                      .map(
                        (type) => `
                        <div class="loan-type-item" data-type="${type.name.toLowerCase().replace(" ", "_")}">
                            <div class="loan-type-icon">
                                ${this.getLoanIcon(type.icon)}
                            </div>
                            <div class="loan-type-info">
                                <strong>${type.name}</strong>
                                <span class="text-muted">Rate: ${type.rate}</span>
                                <span class="text-muted">Max: ${type.max}</span>
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
   * Render amortization preview
   * @returns {string}
   */
  renderAmortizationPreview() {
    const schedule = this.getAmortizationSchedule();

    return `
            <div class="card mt-lg">
                <h4 class="mb-md">Payment Schedule Preview</h4>
                <div class="amortization-list">
                    ${schedule
                      .slice(0, 6)
                      .map(
                        (payment) => `
                        <div class="amortization-item">
                            <div class="payment-month">Month ${payment.month}</div>
                            <div class="payment-amounts">
                                <span class="principal">P: $${payment.principal.toFixed(2)}</span>
                                <span class="interest">I: $${payment.interest.toFixed(2)}</span>
                            </div>
                            <div class="payment-balance">Balance: $${payment.balance.toFixed(2)}</div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
                ${
                  schedule.length > 6
                    ? `
                    <button class="btn btn-ghost btn-block mt-md" id="viewAllScheduleBtn">
                        View Full Schedule
                    </button>
                `
                    : ""
                }
            </div>
        `;
  },

  /**
   * Get loan icon
   * @param {string} icon - Icon name
   * @returns {string}
   */
  getLoanIcon(icon) {
    const icons = {
      user: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      briefcase:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
      home: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      book: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    };
    return icons[icon] || icons["user"];
  },

  /**
   * Calculate EMI
   * @returns {object}
   */
  calculateEMI() {
    const principal =
      parseFloat(document.getElementById("loanAmount")?.value) || 5000;
    const months = parseInt(document.getElementById("loanTerm")?.value) || 24;
    const annualRate =
      parseFloat(document.getElementById("interestRate")?.value) || 12;

    const monthlyRate = annualRate / 12 / 100;

    // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    return {
      emi,
      principal,
      totalInterest,
      totalPayment,
      monthlyRate,
      months,
    };
  },

  /**
   * Get amortization schedule
   * @returns {array}
   */
  getAmortizationSchedule() {
    const { principal, monthlyRate, months, emi } = this.calculateEMI();
    const schedule = [];
    let balance = principal;

    for (let i = 1; i <= months; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = emi - interestPayment;
      balance -= principalPayment;

      schedule.push({
        month: i,
        emi: emi,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
      });
    }

    return schedule;
  },

  /**
   * Bind page events
   */
  bindEvents() {
    // Input changes
    ["loanAmount", "loanTerm", "interestRate"].forEach((id) => {
      const input = document.getElementById(id);
      const slider = document.getElementById("loanAmountSlider");

      if (input) {
        input.addEventListener("input", () => {
          if (slider && id === "loanAmount") {
            slider.value = input.value;
          }
          this.updateResults();
        });
      }

      if (slider) {
        slider.addEventListener("input", () => {
          const amountInput = document.getElementById("loanAmount");
          if (amountInput) {
            amountInput.value = slider.value;
          }
          this.updateResults();
        });
      }
    });

    // Apply now button
    const applyBtn = document.getElementById("applyNowBtn");
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        store.setCurrentPage("eligibility");
      });
    }
  },

  /**
   * Update results
   */
  updateResults() {
    const results = this.calculateEMI();
    const resultsCard = document.querySelector(".results-card");

    if (resultsCard) {
      const emiAmount = resultsCard.querySelector(".emi-amount");
      if (emiAmount) {
        emiAmount.textContent = `$${results.emi.toFixed(2)}`;
      }

      const resultValues = resultsCard.querySelectorAll(".result-value");
      if (resultValues[0])
        resultValues[0].textContent = `$${results.principal.toFixed(2)}`;
      if (resultValues[1])
        resultValues[1].textContent = `$${results.totalInterest.toFixed(2)}`;
      if (resultValues[2])
        resultValues[2].textContent = `$${results.totalPayment.toFixed(2)}`;
    }
  },
};

// Export
window.CalculatorPage = CalculatorPage;
