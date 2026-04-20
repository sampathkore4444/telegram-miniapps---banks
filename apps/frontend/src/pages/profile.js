/**
 * Profile Page
 * User profile and settings
 */

const ProfilePage = {
  /**
   * Render profile page
   * @param {object} params - Page parameters
   * @param {function} callback - Callback to render HTML
   */
  render(params, callback) {
    const user = store.get("user");

    const html = `
            ${this.renderProfileHeader(user)}
            ${this.renderMenuItems()}
            ${this.renderLogoutButton()}
        `;

    callback(html);
    this.bindEvents();
  },

  /**
   * Render profile header
   * @param {object} user - User data
   * @returns {string}
   */
  renderProfileHeader(user) {
    const userData = user || {
      name: "John Doe",
      phone: "+855 12 345 678",
      email: "john@example.com",
    };
    const initials = userData.name
      ? userData.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "JD";

    return `
            <div class="profile-header">
                <div class="profile-avatar">${initials}</div>
                <div class="profile-name">${userData.name}</div>
                <div class="profile-email">${userData.phone}</div>
            </div>
        `;
  },

  /**
   * Render menu items
   * @returns {string}
   */
  renderMenuItems() {
    const menuItems = [
      { icon: "user", label: "Edit Profile", page: "edit-profile" },
      { icon: "bell", label: "Notifications", page: "notifications" },
      { icon: "shield", label: "Security", page: "security" },
      {
        icon: "credit-card",
        label: "Payment Methods",
        page: "payment-methods",
      },
      { icon: "map-pin", label: "Addresses", page: "addresses" },
      { icon: "help-circle", label: "Help & Support", page: "help" },
      { icon: "file-text", label: "Terms & Privacy", page: "terms" },
      { icon: "info", label: "About", page: "about" },
    ];

    return `
            <div class="menu-list">
                ${menuItems
                  .map(
                    (item) => `
                    <div class="menu-item" data-page="${item.page}">
                        <div class="menu-item-left">
                            <div class="menu-item-icon">
                                ${this.getIcon(item.icon)}
                            </div>
                            <span class="menu-item-label">${item.label}</span>
                        </div>
                        <div class="menu-item-arrow">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `;
  },

  /**
   * Get icon SVG
   * @param {string} name - Icon name
   * @returns {string}
   */
  getIcon(name) {
    const icons = {
      user: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      bell: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
      shield:
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      "credit-card":
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
      "map-pin":
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
      "help-circle":
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      "file-text":
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };
    return icons[name] || "";
  },

  /**
   * Render logout button
   * @returns {string}
   */
  renderLogoutButton() {
    return `
            <div class="mt-lg">
                <button class="btn btn-outline btn-block text-error" id="logoutBtn" style="border-color: var(--color-error); color: var(--color-error);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                </button>
            </div>
        `;
  },

  /**
   * Bind page events
   */
  bindEvents() {
    // Menu item clicks
    document.querySelectorAll(".menu-item").forEach((el) => {
      el.addEventListener("click", () => {
        const page = el.dataset.page;
        window.showToast(`${page} coming soon`, "info");
      });
    });

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.logout();
      });
    }
  },

  /**
   * Logout user
   */
  async logout() {
    if (confirm("Are you sure you want to logout?")) {
      window.showLoading(true);
      try {
        await AuthService.logout();
        window.showToast("Logged out successfully", "success");
      } catch (e) {
        window.showToast("Failed to logout", "error");
      } finally {
        window.showLoading(false);
      }
    }
  },
};

// Export for use in other modules
window.ProfilePage = ProfilePage;
