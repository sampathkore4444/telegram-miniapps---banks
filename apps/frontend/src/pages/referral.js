/**
 * Referral Page
 * Referral program and rewards
 */

const ReferralPage = {
  /**
   * Render referral page
   * @param {object} params - Page parameters
   * @param {function} callback - Callback to render HTML
   */
  render(params, callback) {
    const referralCode = store.get("referralCode");
    const referrals = store.get("referrals");

    const html = `
            ${this.renderReferralCard(referralCode)}
            ${this.renderHowItWorks()}
            ${this.renderReferralsList(referrals)}
            ${this.renderRewards()}
        `;

    callback(html);
    this.bindEvents();
  },

  /**
   * Render referral card
   * @param {string} code - Referral code
   * @returns {string}
   */
  renderReferralCard(code) {
    const referralCode = code || "JOHN2026";

    return `
            <div class="card text-center">
                <h3 class="mb-md">Share & Earn</h3>
                <p class="text-muted mb-lg">Invite friends and earn up to $50 for each referral</p>
                <div class="referral-code-container">
                    <div class="referral-code" id="referralCode">${referralCode}</div>
                    <button class="btn btn-outline mt-md" id="copyCodeBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        Copy Code
                    </button>
                </div>
                <button class="btn btn-primary btn-block mt-lg" id="shareBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="18" cy="5" r="3"/>
                        <circle cx="6" cy="12" r="3"/>
                        <circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.58" y2="10.49"/>
                    </svg>
                    Share with Friends
                </button>
            </div>
        `;
  },

  /**
   * Render how it works
   * @returns {string}
   */
  renderHowItWorks() {
    return `
            <div class="card mt-lg">
                <h4 class="mb-md">How it works</h4>
                <div class="steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <strong>Share your code</strong>
                            <p class="text-muted">Send your referral code to friends</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <strong>Friend signs up</strong>
                            <p class="text-muted">They create an account using your code</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <strong>You earn rewards</strong>
                            <p class="text-muted">Get $10-50 for each successful referral</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
  },

  /**
   * Render referrals list
   * @param {array} referrals - Referrals array
   * @returns {string}
   */
  renderReferralsList(referrals) {
    // Mock data
    const mockReferrals =
      referrals?.length > 0
        ? referrals
        : [
            {
              name: "Sokha",
              date: "Mar 15, 2026",
              status: "completed",
              reward: 25,
            },
            {
              name: "Dara",
              date: "Mar 10, 2026",
              status: "pending",
              reward: 0,
            },
          ];

    return `
            <div class="card mt-lg">
                <h4 class="mb-md">Your Referrals</h4>
                ${
                  mockReferrals.length > 0
                    ? `
                    <div class="referrals-list">
                        ${mockReferrals
                          .map(
                            (ref) => `
                            <div class="referral-item">
                                <div class="referral-info">
                                    <strong>${ref.name}</strong>
                                    <p class="text-muted">${ref.date}</p>
                                </div>
                                <div class="badge ${ref.status === "completed" ? "badge-success" : "badge-warning"}">
                                    ${ref.status === "completed" ? `+$${ref.reward}` : "Pending"}
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                `
                    : `
                    <p class="text-center text-muted">No referrals yet</p>
                `
                }
            </div>
        `;
  },

  /**
   * Render rewards
   * @returns {string}
   */
  renderRewards() {
    return `
            <div class="card mt-lg">
                <h4 class="mb-md">Rewards Earned</h4>
                <div class="text-center">
                    <div class="balance-amount text-success">$50.00</div>
                    <p class="text-muted">Total earned from referrals</p>
                </div>
            </div>
        `;
  },

  /**
   * Bind page events
   */
  bindEvents() {
    // Copy code button
    const copyBtn = document.getElementById("copyCodeBtn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const code = document.getElementById("referralCode").textContent;
        navigator.clipboard.writeText(code).then(() => {
          window.showToast("Code copied!", "success");
        });
      });
    }

    // Share button
    const shareBtn = document.getElementById("shareBtn");
    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        this.shareReferral();
      });
    }
  },

  /**
   * Share referral code
   */
  shareReferral() {
    const code =
      document.getElementById("referralCode")?.textContent || "JOHN2026";
    const text = `Join me on Bank App! Use my referral code ${code} to sign up and we both get rewards!`;

    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.shareUrl(text);
    } else if (navigator.share) {
      navigator.share({
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        window.showToast("Link copied to clipboard!", "success");
      });
    }
  },
};

// Export for use in other modules
window.ReferralPage = ReferralPage;
