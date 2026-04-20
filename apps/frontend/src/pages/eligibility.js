/**
 * Eligibility Page
 * Loan eligibility checker
 */

const EligibilityPage = {
  /**
   * Render eligibility page
   * @param {object} params - Page parameters
   * @param {function} callback - Callback to render HTML
   */
  render(params, callback) {
    const html = `
            ${this.renderInfoCard()}
            ${this.renderEligibilityForm()}
            ${this.renderResult(params)}
        `;

    callback(html);
    this.bindEvents();
  },

  /**
   * Render info card
   * @returns {string}
   */
  renderInfoCard() {
    return `
            <div class="card mb-lg">
                <div class="text-center">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" class="mb-md">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <h3>Check Your Eligibility</h3>
                    <p class="text-muted mt-sm">Find out how much you can borrow in just a few steps</p>
                </div>
            </div>
        `;
  },

  /**
   * Render eligibility form
   * @returns {string}
   */
  renderEligibilityForm() {
    return `
            <div class="card">
                <form id="eligibilityForm">
                    <div class="form-group">
                        <label class="form-label">Monthly Income (USD)</label>
                        <input type="number" class="form-input" name="monthly_income" placeholder="Enter your monthly income" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Employment Type</label>
                        <select class="form-input" name="employment_type" required>
                            <option value="">Select employment type</option>
                            <option value="salaried">Salaried Employee</option>
                            <option value="self_employed">Self Employed</option>
                            <option value="business_owner">Business Owner</option>
                            <option value="freelancer">Freelancer</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Loan Amount Needed (USD)</label>
                        <input type="number" class="form-input" name="loan_amount" placeholder="100 - 10000" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Loan Purpose</label>
                        <select class="form-input" name="loan_purpose" required>
                            <option value="">Select purpose</option>
                            <option value="personal">Personal Expenses</option>
                            <option value="business">Business</option>
                            <option value="education">Education</option>
                            <option value="medical">Medical</option>
                            <option value="home">Home Improvement</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">
                        Check Eligibility
                    </button>
                </form>
            </div>
        `;
  },

  /**
   * Render result
   * @param {object} params - Page parameters
   * @returns {string}
   */
  renderResult(params) {
    if (!params.eligible) {
      return "";
    }

    return `
            <div class="card mt-lg">
                <div class="text-center">
                    <div class="badge badge-success mb-md" style="font-size: 1rem; padding: 0.5rem 1rem;">
                        ✓ You Qualify!
                    </div>
                    <h2 class="mb-md">Up to $${params.max_amount || "5,000"}</h2>
                    <p class="text-muted mb-lg">Based on your eligibility, you can borrow up to this amount</p>
                    <button class="btn btn-primary btn-block" id="proceedLoanBtn">
                        Apply Now
                    </button>
                    <button class="btn btn-ghost btn-block mt-sm" id="backBtn">
                        Modify Details
                    </button>
                </div>
            </div>
        `;
  },

  /**
   * Bind page events
   */
  bindEvents() {
    const form = document.getElementById("eligibilityForm");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.checkEligibility(form);
      });
    }

    const proceedBtn = document.getElementById("proceedLoanBtn");
    if (proceedBtn) {
      proceedBtn.addEventListener("click", () => {
        window.showToast("Loan application coming soon", "info");
      });
    }
  },

  /**
   * Check eligibility
   * @param {HTMLFormElement} form - Form element
   */
  async checkEligibility(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Show loading
    window.showLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock result
      const eligible = parseInt(data.monthly_income) > 300;
      const maxAmount = eligible
        ? Math.min(parseInt(data.loan_amount), 5000)
        : 0;

      if (eligible) {
        store.setCurrentPage(
          "eligibility?eligible=true&max_amount=" + maxAmount,
        );
      } else {
        window.showToast(
          "Sorry, you do not meet the eligibility criteria",
          "error",
        );
      }
    } catch (error) {
      window.showToast(
        "Failed to check eligibility. Please try again.",
        "error",
      );
    } finally {
      window.showLoading(false);
    }
  },
};

// Export for use in other modules
window.EligibilityPage = EligibilityPage;
