/**
 * Settings & Security Page
 * User settings, security options, and preferences
 */

const SettingsPage = {
  /**
   * Render settings page
   * @param {object} params - Page parameters
   * @param {function} callback - Callback to render HTML
   */
  render(params, callback) {
    const html = `
            ${this.renderSecuritySection()}
            ${this.renderPreferencesSection()}
            ${this.renderPrivacySection()}
            ${this.renderAccountSection()}
        `;

    callback(html);
    this.bindEvents();
  },

  /**
   * Render security section
   * @returns {string}
   */
  renderSecuritySection() {
    return `
            <div class="card">
                <h4 class="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Security
                </h4>
                <div class="settings-list">
                    <div class="settings-item" data-action="change_pin">
                        <div class="settings-icon" style="background-color: rgba(36, 129, 204, 0.1); color: #2481CC">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <div class="settings-content">
                            <span class="settings-label">Change PIN</span>
                            <span class="settings-desc">Update your transaction PIN</span>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                    <div class="settings-item" data-action="change_password">
                        <div class="settings-icon" style="background-color: rgba(39, 174, 96, 0.1); color: #27AE60">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                            </svg>
                        </div>
                        <div class="settings-content">
                            <span class="settings-label">Password</span>
                            <span class="settings-desc">Change your login password</span>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                    <div class="settings-item" data-action="two_factor">
                        <div class="settings-icon" style="background-color: rgba(243, 156, 18, 0.1); color: #F39C12">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                <path d="M9 12l2 2 4-4"/>
                            </svg>
                        </div>
                        <div class="settings-content">
                            <span class="settings-label">Two-Factor Authentication</span>
                            <span class="settings-desc">Add extra security layer</span>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" id="twoFactorToggle">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item" data-action="face_id">
                        <div class="settings-icon" style="background-color: rgba(155, 89, 182, 0.1); color: #9B59B6">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </div>
                        <div class="settings-content">
                            <span class="settings-label">Face ID / Biometric</span>
                            <span class="settings-desc">Use face recognition to login</span>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" id="biometricToggle" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item" data-action="block_card">
                        <div class="settings-icon" style="background-color: rgba(231, 76, 60, 0.1); color: #E74C3C">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                            </svg>
                        </div>
                        <div class="settings-content">
                            <span class="settings-label" style="color: #E74C3C">Block Card</span>
                            <span class="settings-desc">Emergency card block</span>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron" style="color: #E74C3C">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;
  },

  /**
   * Render preferences section
   * @returns {string}
   */
  renderPreferencesSection() {
    return `
            <div class="card mt-lg">
                <h4 class="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    Preferences
                </h4>
                <div class="settings-list">
                    <div class="settings-item" data-action="language">
                        <div class="settings-icon" style="background-color: rgba(52, 152, 219, 0.1); color: #3498DB">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="2" y1="12" x2="22" y2="12"/>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                        </div>
                        <div class="settings-content">
                            <span class="settings-label">Language</span>
                            <span class="settings-desc">English</span>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                    <div class="settings-item" data-action="currency">
                        <div class="settings-icon" style="background-color: rgba(39, 174, 96, 0.1); color: #27AE60">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="1" x2="12" y2="23"/>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                        </div>
                        <div class="settings-content">
                            <span class="settings-label">Currency</span>
                            <span class="settings-desc">USD ($)</span>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                    <div class="settings-item">
                        <div class="settings-icon" style="background-color: rgba(243, 156, 18, 0.1); color: #F39C12">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                        </div>
                        <div class="settings-content">
                            <span class="settings-label">Push Notifications</span>
                            <span class="settings-desc">Receive alerts</span>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item">
                        <div class="settings-icon" style="background-color: rgba(155, 89, 182, 0.1); color: #9B59B6">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                        <div class="settings-content">
                            <span class="settings-label">SMS Alerts</span>
                            <span class="settings-desc">Transaction notifications</span>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;
  },

  /**
   * Render privacy section
   * @returns {string}
   */
  renderPrivacySection() {
    return `
            <div class="card mt-lg">
                <h4 class="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Privacy
                </h4>
                <div class="settings-list">
                    <div class="settings-item" data-action="data_usage">
                        <div class="settings-icon" style="background-color: rgba(52, 152, 219, 0.1); color: #3498DB">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                        </div>
                        <div class="settings-content">
                            <span class="settings-label">Data & Privacy</span>
                            <span class="settings-desc">Manage your data</span>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                    <div class="settings-item" data-action="terms">
                        <div class="settings-icon" style="background-color: rgba(127, 140, 141, 0.1); color: #7F8C8D">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                        </div>
                        <div class="settings-content">
                            <span class="settings-label">Terms of Service</span>
                            <span class="settings-desc">Read our terms</span>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;
  },

  /**
   * Render account section
   * @returns {string}
   */
  renderAccountSection() {
    return `
            <div class="card mt-lg">
                <h4 class="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Account
                </h4>
                <div class="settings-list">
                    <div class="settings-item" data-action="download_data">
                        <div class="settings-icon" style="background-color: rgba(36, 129, 204, 0.1); color: #2481CC">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </div>
                        <div class="settings-content">
                            <span class="settings-label">Download My Data</span>
                            <span class="settings-desc">Export your account data</span>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                    <div class="settings-item danger" data-action="delete_account">
                        <div class="settings-icon" style="background-color: rgba(231, 76, 60, 0.1); color: #E74C3C">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </div>
                        <div class="settings-content">
                            <span class="settings-label" style="color: #E74C3C">Delete Account</span>
                            <span class="settings-desc">Permanently delete your account</span>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron" style="color: #E74C3C">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;
  },

  /**
   * Bind page events
   */
  bindEvents() {
    document.querySelectorAll(".settings-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (
          e.target.classList.contains("toggle") ||
          e.target.closest(".toggle")
        )
          return;
        const action = item.dataset.action;
        this.handleAction(action);
      });
    });
  },

  /**
   * Handle action
   * @param {string} action - Action name
   */
  handleAction(action) {
    switch (action) {
      case "change_pin":
        window.showToast("PIN change coming soon", "info");
        break;
      case "change_password":
        window.showToast("Password change coming soon", "info");
        break;
      case "block_card":
        if (confirm("Are you sure you want to block your card?")) {
          window.showToast("Card has been blocked", "success");
        }
        break;
      case "delete_account":
        if (
          confirm(
            "Are you sure you want to delete your account? This action cannot be undone.",
          )
        ) {
          window.showToast("Account deletion coming soon", "info");
        }
        break;
      default:
        window.showToast("Coming soon", "info");
    }
  },
};

// Export
window.SettingsPage = SettingsPage;
