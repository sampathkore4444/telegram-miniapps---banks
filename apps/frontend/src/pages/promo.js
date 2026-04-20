/**
 * Promo / Lucky Draw Page
 * Gamified promotional campaigns and rewards
 */

const PromoPage = {
  isSpinning: false,

  /**
   * Render promo page
   * @param {object} params - Page parameters
   * @param {function} callback - Callback to render HTML
   */
  render(params, callback) {
    const html = `
            ${this.renderPromoHeader()}
            ${this.renderLuckyWheel()}
            ${this.renderPrizes()}
            ${this.renderCampaigns()}
        `;

    callback(html);
    this.bindEvents();
  },

  /**
   * Render promo header
   * @returns {string}
   */
  renderPromoHeader() {
    return `
            <div class="promo-header">
                <div class="promo-badge">
                    <span class="badge badge-warning">🎉 Limited Time</span>
                </div>
                <h2>Spin & Win!</h2>
                <p class="text-muted">Try your luck and win amazing prizes</p>
                <div class="promo-timer">
                    <span>Ends in: </span>
                    <strong id="countdown">23:45:12</strong>
                </div>
            </div>
        `;
  },

  /**
   * Render lucky wheel
   * @returns {string}
   */
  renderLuckyWheel() {
    return `
            <div class="wheel-container">
                <div class="wheel-pointer"></div>
                <div class="wheel" id="luckyWheel">
                    ${this.renderWheelSegments()}
                </div>
                <button class="spin-btn" id="spinBtn">
                    SPIN
                </button>
                <div class="spin-cost">
                    Free for today! (3 spins left)
                </div>
            </div>
        `;
  },

  /**
   * Render wheel segments
   * @returns {string}
   */
  renderWheelSegments() {
    const prizes = [
      { text: "$10", color: "#27AE60", type: "cash" },
      { text: "Try Again", color: "#3498DB", type: "retry" },
      { text: "$5", color: "#F39C12", type: "cash" },
      { text: "Lucky", color: "#9B59B6", type: "lucky" },
      { text: "$2", color: "#E74C3C", type: "cash" },
      { text: "Bonus", color: "#1ABC9C", type: "bonus" },
    ];

    const segmentAngle = 360 / prizes.length;

    return prizes
      .map((prize, index) => {
        const rotation = index * segmentAngle;
        return `
                <div class="wheel-segment" style="transform: rotate(${rotation}deg); background-color: ${prize.color};">
                    <span class="segment-text" style="transform: rotate(${segmentAngle / 2}deg);">${prize.text}</span>
                </div>
            `;
      })
      .join("");
  },

  /**
   * Render prizes section
   * @returns {string}
   */
  renderPrizes() {
    const prizes = [
      { title: "Grand Prize", amount: "$500", chance: "1 in 10,000" },
      { title: "First Prize", amount: "$100", chance: "1 in 1,000" },
      { title: "Second Prize", amount: "$50", chance: "1 in 500" },
      { title: "Consolation", amount: "$5", chance: "1 in 50" },
    ];

    return `
            <div class="card mt-lg">
                <h4 class="mb-md">Prizes Available</h4>
                <div class="prizes-grid">
                    ${prizes
                      .map(
                        (prize) => `
                        <div class="prize-item">
                            <div class="prize-amount">${prize.amount}</div>
                            <div class="prize-title">${prize.title}</div>
                            <div class="prize-chance">${prize.chance}</div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `;
  },

  /**
   * Render campaigns section
   * @returns {string}
   */
  renderCampaigns() {
    const campaigns = [
      {
        title: "New Year Special",
        description: "Get 2x cashback on your first 5 transactions",
        expires: "Dec 31, 2026",
        active: true,
      },
      {
        title: "Refer & Earn",
        description: "Invite friends and earn up to $50 per referral",
        expires: "Ongoing",
        active: true,
      },
      {
        title: "Lucky Monday",
        description: "Every Monday, 10 random users win $20",
        expires: "Every Monday",
        active: true,
      },
    ];

    return `
            <div class="card mt-lg">
                <h4 class="mb-md">Active Campaigns</h4>
                <div class="campaigns-list">
                    ${campaigns
                      .map(
                        (campaign) => `
                        <div class="campaign-item">
                            <div class="campaign-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                            </div>
                            <div class="campaign-content">
                                <div class="campaign-header">
                                    <strong>${campaign.title}</strong>
                                    ${campaign.active ? '<span class="badge badge-success">Active</span>' : ""}
                                </div>
                                <p class="campaign-desc">${campaign.description}</p>
                                <div class="campaign-expires">Expires: ${campaign.expires}</div>
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
   * Bind page events
   */
  bindEvents() {
    const spinBtn = document.getElementById("spinBtn");
    if (spinBtn) {
      spinBtn.addEventListener("click", () => {
        if (!this.isSpinning) {
          this.spin();
        }
      });
    }

    // Update countdown
    this.startCountdown();
  },

  /**
   * Start countdown timer
   */
  startCountdown() {
    // Simple countdown timer
    let hours = 23;
    let minutes = 45;
    let seconds = 12;

    const updateTimer = () => {
      const countdown = document.getElementById("countdown");
      if (countdown) {
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }

        countdown.textContent = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }
    };

    setInterval(updateTimer, 1000);
  },

  /**
   * Spin the wheel
   */
  spin() {
    if (this.isSpinning) return;

    this.isSpinning = true;
    const spinBtn = document.getElementById("spinBtn");
    const wheel = document.getElementById("luckyWheel");

    spinBtn.disabled = true;
    spinBtn.textContent = "SPINNING...";

    // Random rotation between 5 and 10 full rotations
    const rotations = 5 + Math.random() * 5;
    const degrees = rotations * 360;

    // Apply rotation
    wheel.style.transition =
      "transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)";
    wheel.style.transform = `rotate(${degrees}deg)`;

    // Determine prize (simplified)
    const segmentAngle = 360 / 6;
    const finalAngle = degrees % 360;
    const prizeIndex =
      Math.floor((360 - finalAngle + segmentAngle / 2) / segmentAngle) % 6;

    const prizes = ["$10", "Try Again", "$5", "Lucky", "$2", "Bonus"];
    const prize = prizes[prizeIndex];

    // Show result after animation
    setTimeout(() => {
      this.isSpinning = false;
      spinBtn.disabled = false;
      spinBtn.textContent = "SPIN";

      if (prize === "Try Again") {
        window.showToast("Better luck next time! Try again.", "info");
      } else {
        window.showToast(`🎉 Congratulations! You won ${prize}!`, "success");
      }

      // Reset wheel position visually
      wheel.style.transition = "none";
      wheel.style.transform = `rotate(${finalAngle}deg)`;
    }, 5000);
  },
};

// Export
window.PromoPage = PromoPage;
