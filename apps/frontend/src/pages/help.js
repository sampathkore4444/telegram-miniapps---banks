/**
 * Help & Support Page
 * Customer support and FAQ
 */

const HelpPage = {
  /**
   * Render help page
   * @param {object} params - Page parameters
   * @param {function} callback - Callback to render HTML
   */
  render(params, callback) {
    const html = `
            ${this.renderSearchBar()}
            ${this.renderQuickSupport()}
            ${this.renderFAQ()}
            ${this.renderContactOptions()}
        `;

    callback(html);
    this.bindEvents();
  },

  /**
   * Render search bar
   * @returns {string}
   */
  renderSearchBar() {
    return `
            <div class="card">
                <div class="search-container">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input type="text" class="form-input search-input" placeholder="Search help topics...">
                </div>
            </div>
        `;
  },

  /**
   * Render quick support options
   * @returns {string}
   */
  renderQuickSupport() {
    const options = [
      {
        icon: "message-circle",
        label: "Chat with Us",
        desc: "Available 24/7",
        color: "#2481CC",
      },
      {
        icon: "phone",
        label: "Call Support",
        desc: "+855 23 888 888",
        color: "#27AE60",
      },
      {
        icon: "mail",
        label: "Email Us",
        desc: "support@bank.com",
        color: "#F39C12",
      },
      {
        icon: "map-pin",
        label: "Find Branch",
        desc: "View locations",
        color: "#9B59B6",
      },
    ];

    return `
            <div class="card">
                <h4 class="mb-md">Quick Support</h4>
                <div class="quick-support-grid">
                    ${options
                      .map(
                        (opt) => `
                        <div class="quick-support-item" data-action="${opt.label.toLowerCase().replace(" ", "_")}">
                            <div class="qs-icon" style="background-color: ${opt.color}20; color: ${opt.color}">
                                ${this.getIcon(opt.icon)}
                            </div>
                            <div class="qs-label">${opt.label}</div>
                            <div class="qs-desc">${opt.desc}</div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `;
  },

  /**
   * Render FAQ section
   * @returns {string}
   */
  renderFAQ() {
    const faqs = [
      {
        question: "How do I open a bank account?",
        answer:
          'You can open an account through our Telegram Mini App or visit any of our branches. Simply click on "Open Account" and follow the guided process.',
      },
      {
        question: "What documents do I need for KYC?",
        answer:
          "For basic accounts, you need a valid ID (National ID or Passport). For full access, additional documents like proof of income may be required.",
      },
      {
        question: "How long does loan approval take?",
        answer:
          "Personal loans are typically approved within 24-48 hours after submitting all required documents.",
      },
      {
        question: "How do I reset my PIN?",
        answer:
          "Visit any ATM or our mobile app to reset your PIN. You can also call our customer support for assistance.",
      },
      {
        question: "What is the minimum balance requirement?",
        answer:
          "Our basic savings account requires no minimum balance. Premium accounts may have different requirements.",
      },
    ];

    return `
            <div class="card mt-lg">
                <h4 class="mb-md">Frequently Asked Questions</h4>
                <div class="faq-list">
                    ${faqs
                      .map(
                        (faq, index) => `
                        <div class="faq-item" data-index="${index}">
                            <div class="faq-question">
                                <span>${faq.question}</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="faq-chevron">
                                    <polyline points="6 9 12 15 18 9"/>
                                </svg>
                            </div>
                            <div class="faq-answer">${faq.answer}</div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `;
  },

  /**
   * Render contact options
   * @returns {string}
   */
  renderContactOptions() {
    return `
            <div class="card mt-lg">
                <h4 class="mb-md">Other Ways to Reach Us</h4>
                <div class="contact-options">
                    <div class="contact-option">
                        <div class="contact-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                        <div>
                            <strong>Live Chat</strong>
                            <p class="text-muted">Chat with our AI assistant</p>
                        </div>
                    </div>
                    <div class="contact-option">
                        <div class="contact-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                        </div>
                        <div>
                            <strong>Email Support</strong>
                            <p class="text-muted">support@bank.com</p>
                        </div>
                    </div>
                    <div class="contact-option">
                        <div class="contact-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                            </svg>
                        </div>
                        <div>
                            <strong>Hotline</strong>
                            <p class="text-muted">1200 (Free), +855 23 888 888</p>
                        </div>
                    </div>
                </div>
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
      "message-circle":
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
      phone:
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
      mail: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
      "map-pin":
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    };
    return icons[name] || "";
  },

  /**
   * Bind page events
   */
  bindEvents() {
    // Quick support items
    document.querySelectorAll(".quick-support-item").forEach((item) => {
      item.addEventListener("click", () => {
        const action = item.dataset.action;
        this.handleQuickSupport(action);
      });
    });

    // FAQ items
    document.querySelectorAll(".faq-item").forEach((item) => {
      item.addEventListener("click", () => {
        item.classList.toggle("active");
      });
    });
  },

  /**
   * Handle quick support action
   * @param {string} action - Action name
   */
  handleQuickSupport(action) {
    switch (action) {
      case "chat_with_us":
        window.showToast("Opening chat...", "info");
        break;
      case "call_support":
        window.showToast("Calling...", "info");
        break;
      case "email_us":
        window.showToast("Email coming soon", "info");
        break;
      case "find_branch":
        window.showToast("Finding branches...", "info");
        break;
    }
  },
};

// Export
window.HelpPage = HelpPage;
