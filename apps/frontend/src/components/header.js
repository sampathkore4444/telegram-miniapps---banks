/**
 * Header Component
 * Handles header interactions and updates
 */

const HeaderComponent = {
  /**
   * Initialize header component
   */
  init() {
    this.header = document.getElementById("header");
    this.headerTitle = document.getElementById("headerTitle");
    this.backBtn = document.getElementById("backBtn");
    this.notificationBtn = document.getElementById("notificationBtn");

    this.bindEvents();
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Back button click
    if (this.backBtn) {
      this.backBtn.addEventListener("click", () => {
        window.history.back();
      });
    }

    // Notification button click
    if (this.notificationBtn) {
      this.notificationBtn.addEventListener("click", () => {
        this.showNotifications();
      });
    }

    // Subscribe to store changes
    store.subscribe("currentPage", (page) => {
      this.updateForPage(page);
    });
  },

  /**
   * Update header for current page
   * @param {string} page - Page name
   */
  updateForPage(page) {
    const titles = {
      home: "Bank",
      accounts: "My Accounts",
      loans: "Loans",
      eligibility: "Check Eligibility",
      referral: "Refer Friends",
      wallet: "My Wallet",
      profile: "Profile",
      more: "More",
    };

    this.setTitle(titles[page] || "Bank");
  },

  /**
   * Set header title
   * @param {string} title - New title
   */
  setTitle(title) {
    if (this.headerTitle) {
      this.headerTitle.textContent = title;
    }
  },

  /**
   * Show back button
   * @param {boolean} show - Show/hide
   */
  showBack(show) {
    if (this.backBtn) {
      this.backBtn.style.display = show ? "flex" : "none";
    }
  },

  /**
   * Show notifications panel
   */
  showNotifications() {
    // Navigate to notifications page or show modal
    window.dispatchEvent(
      new CustomEvent("navigate", {
        detail: { page: "notifications" },
      }),
    );
  },

  /**
   * Show user avatar in header (for logged in users)
   */
  showUserAvatar() {
    const user = store.get("user");
    if (user && this.notificationBtn) {
      // Add user avatar icon
      const avatar = document.createElement("div");
      avatar.className = "user-avatar-small";
      avatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : "U";
      this.notificationBtn.appendChild(avatar);
    }
  },

  /**
   * Set primary color
   * @param {string} color - Color hex
   */
  setColor(color) {
    if (this.header) {
      this.header.style.backgroundColor = color;
    }
  },
};

// Export for use in other modules
window.HeaderComponent = HeaderComponent;
