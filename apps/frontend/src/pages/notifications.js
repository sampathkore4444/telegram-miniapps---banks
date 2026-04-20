/**
 * Notifications Page
 * User notifications and alerts
 */

const NotificationsPage = {
  /**
   * Render notifications page
   * @param {object} params - Page parameters
   * @param {function} callback - Callback to render HTML
   */
  render(params, callback) {
    const html = `
            ${this.renderFilterTabs()}
            ${this.renderNotificationsList()}
        `;

    callback(html);
    this.bindEvents();
  },

  /**
   * Render filter tabs
   * @returns {string}
   */
  renderFilterTabs() {
    return `
            <div class="filter-tabs">
                <button class="filter-tab active" data-filter="all">All</button>
                <button class="filter-tab" data-filter="transactions">Transactions</button>
                <button class="filter-tab" data-filter="loans">Loans</button>
                <button class="filter-tab" data-filter="promo">Promotions</button>
            </div>
        `;
  },

  /**
   * Render notifications list
   * @returns {string}
   */
  renderNotificationsList() {
    const notifications = this.getMockNotifications();

    return `
            <div class="notifications-list">
                ${notifications
                  .map(
                    (notif) => `
                    <div class="notification-item ${notif.read ? "" : "unread"}" data-id="${notif.id}">
                        <div class="notification-icon" style="background-color: ${notif.color}">
                            ${notif.icon}
                        </div>
                        <div class="notification-content">
                            <div class="notification-title">${notif.title}</div>
                            <div class="notification-message">${notif.message}</div>
                            <div class="notification-time">${notif.time}</div>
                        </div>
                        ${
                          notif.action
                            ? `
                            <button class="notification-action btn btn-sm" data-action="${notif.action}">
                                ${notif.actionLabel}
                            </button>
                        `
                            : ""
                        }
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `;
  },

  /**
   * Get mock notifications
   * @returns {array}
   */
  getMockNotifications() {
    return [
      {
        id: 1,
        title: "Payment Received",
        message: "You received $150.00 from John Doe",
        time: "Today, 2:30 PM",
        read: false,
        color: "rgba(39, 174, 96, 0.1)",
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#27AE60" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
      },
      {
        id: 2,
        title: "Loan Approved",
        message: "Your loan application for $2,500 has been approved!",
        time: "Today, 11:00 AM",
        read: false,
        color: "rgba(36, 129, 204, 0.1)",
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2481CC" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        action: "view_loan",
        actionLabel: "View",
      },
      {
        id: 3,
        title: "Bill Due Reminder",
        message: "Your electricity bill of $45.00 is due in 3 days",
        time: "Yesterday",
        read: true,
        color: "rgba(243, 156, 18, 0.1)",
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F39C12" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
      },
      {
        id: 4,
        title: "Promo: Lucky Draw",
        message: "You have a chance to win $500! Open the app now.",
        time: "Mar 15",
        read: true,
        color: "rgba(155, 89, 182, 0.1)",
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9B59B6" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
        action: "join_promo",
        actionLabel: "Join",
      },
      {
        id: 5,
        title: "Referral Bonus",
        message: "Your friend Sokha signed up! You earned $25",
        time: "Mar 14",
        read: true,
        color: "rgba(39, 174, 96, 0.1)",
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#27AE60" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.58" y2="10.49"/></svg>',
      },
      {
        id: 6,
        title: "Account Update",
        message: "Your savings account interest has been credited",
        time: "Mar 10",
        read: true,
        color: "rgba(36, 129, 204, 0.1)",
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2481CC" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
      },
    ];
  },

  /**
   * Bind page events
   */
  bindEvents() {
    // Filter tabs
    document.querySelectorAll(".filter-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document
          .querySelectorAll(".filter-tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        window.showToast("Filtering...", "info");
      });
    });

    // Notification items
    document.querySelectorAll(".notification-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.target.classList.contains("notification-action")) return;
        item.classList.remove("unread");
      });
    });

    // Action buttons
    document.querySelectorAll(".notification-action").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
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
      case "view_loan":
        store.setCurrentPage("loans");
        break;
      case "join_promo":
        store.setCurrentPage("promo");
        break;
      default:
        window.showToast("Coming soon", "info");
    }
  },
};

// Export
window.NotificationsPage = NotificationsPage;
