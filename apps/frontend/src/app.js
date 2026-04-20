/**
 * Main Application Entry Point
 * Telegram Mini App - Bank
 */

// Application Config
const AppConfig = {
  appName: "Bank Mini App",
  version: "1.0.0",
};

// Initialize Application
const App = {
  /**
   * Initialize the app
   */
  async init() {
    console.log(`Initializing ${AppConfig.appName} v${AppConfig.version}...`);

    // Initialize Telegram WebApp
    this.initTelegram();

    // Initialize components
    this.initComponents();

    // Initialize routing
    this.initRouting();

    // Initialize event listeners
    this.initEvents();

    // Check authentication
    await this.checkAuth();

    console.log("App initialized successfully");
  },

  /**
   * Initialize Telegram WebApp
   */
  initTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;

      // Expand to full height
      tg.expand();

      // Configure theme
      tg.themeParams = {
        bg_color: "#F5F7FA",
        text_color: "#2C3E50",
        hint_color: "#7F8C8D",
        link_color: "#2481CC",
        button_color: "#2481CC",
        button_text_color: "#FFFFFF",
      };

      // Ready callback
      tg.ready();

      console.log("Telegram WebApp initialized");
    }
  },

  /**
   * Initialize components
   */
  initComponents() {
    HeaderComponent.init();

    // Initialize page registry with all pages
    window.pageRegistry = {
      // Core pages
      home: { render: HomePage.render.bind(HomePage) },
      accounts: { render: AccountsPage.render.bind(AccountsPage) },
      loans: { render: LoansPage.render.bind(LoansPage) },
      eligibility: {
        render: EligibilityPage.render.bind(EligibilityPage),
        showBack: true,
      },
      referral: { render: ReferralPage.render.bind(ReferralPage) },
      wallet: { render: WalletPage.render.bind(WalletPage) },
      profile: { render: ProfilePage.render.bind(ProfilePage) },
      more: { render: ProfilePage.render.bind(ProfilePage) },

      // Additional pages
      notifications: {
        render: NotificationsPage.render.bind(NotificationsPage),
        showBack: true,
      },
      help: { render: HelpPage.render.bind(HelpPage), showBack: true },
      settings: {
        render: SettingsPage.render.bind(SettingsPage),
        showBack: true,
      },
      kyc: { render: KYCPage.render.bind(KYCPage), showBack: true },
      quiz: { render: QuizPage.render.bind(QuizPage), showBack: true },
      promo: { render: PromoPage.render.bind(PromoPage), showBack: true },
      bills: { render: BillsPage.render.bind(BillsPage), showBack: true },
      calculator: {
        render: CalculatorPage.render.bind(CalculatorPage),
        showBack: true,
      },
      // Lead generation page
      leads: { render: LeadsPage.render.bind(LeadsPage), showBack: true },
      // Spin wheel page
      spinwheel: {
        render: SpinWheelPage.render.bind(SpinWheelPage),
        showBack: true,
      },
    };
  },

  /**
   * Initialize routing
   */
  initRouting() {
    // Bottom navigation
    const bottomNav = document.getElementById("bottomNav");
    if (bottomNav) {
      const navItems = bottomNav.querySelectorAll(".nav-item");

      navItems.forEach((item) => {
        item.addEventListener("click", () => {
          const page = item.dataset.page;
          this.navigate(page);

          // Update active state
          navItems.forEach((nav) => nav.classList.remove("active"));
          item.classList.add("active");
        });
      });
    }

    // Set initial page
    const urlParams = new URLSearchParams(window.location.search);
    const initialPage = urlParams.get("page") || "home";
    this.navigate(initialPage);
  },

  /**
   * Navigate to page
   * @param {string} page - Page name
   */
  navigate(page) {
    const main = document.getElementById("main");
    if (!main) return;

    // Get page config
    const pageConfig = window.pageRegistry[page] || window.pageRegistry.home;
    const showBack = pageConfig.showBack || false;

    // Update header
    const backBtn = document.getElementById("backBtn");
    const headerTitle = document.getElementById("headerTitle");

    if (backBtn) {
      backBtn.style.display = showBack ? "flex" : "none";
    }

    if (headerTitle) {
      const titles = {
        home: "Bank",
        accounts: "My Accounts",
        loans: "Loans",
        eligibility: "Check Eligibility",
        referral: "Refer Friends",
        wallet: "My Wallet",
        profile: "Profile",
        more: "More",
        notifications: "Notifications",
        help: "Help & Support",
        settings: "Settings",
        kyc: "Verify Identity",
        quiz: "Financial Quiz",
        promo: "Promotions",
        bills: "Pay Bills",
        calculator: "Loan Calculator",
        leads: "Compare & Earn",
        spinwheel: "Daily Spin",
      };
      headerTitle.textContent = titles[page] || "Bank";
    }

    // Store page
    store.setCurrentPage(page);

    // Render page
    if (pageConfig.render) {
      pageConfig.render({}, (html) => {
        main.innerHTML = html;
      });
    }
  },

  /**
   * Initialize events
   */
  initEvents() {
    // Listen for auth logout
    window.addEventListener("auth:logout", () => {
      this.onLogout();
    });

    // Listen for navigate events
    window.addEventListener("navigate", (e) => {
      this.navigate(e.detail.page);
    });
  },

  /**
   * Check authentication
   */
  async checkAuth() {
    // Check if user is authenticated
    if (AuthService.isAuthenticated()) {
      try {
        await AuthService.verify();
      } catch (e) {
        console.log("Authentication verification failed");
      }
    } else {
      // Try Telegram login
      try {
        await AuthService.loginWithTelegram();
      } catch (e) {
        console.log("Telegram login not available, using demo mode");
        // Set demo user for testing
        store.setUser({
          id: "1",
          name: "John Doe",
          phone: "+85512345678",
        });
        store.setAccounts([
          {
            id: "1",
            type: "Savings Account",
            number: "4532",
            balance: 5240.5,
            is_primary: true,
          },
          {
            id: "2",
            type: "Checking Account",
            number: "8821",
            balance: 1250.0,
            is_primary: false,
          },
        ]);
      }
    }
  },

  /**
   * Handle logout
   */
  onLogout() {
    window.showToast("Logged out", "info");
    this.navigate("home");
  },
};

// Global helper functions
window.showLoading = function (show) {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.style.display = show ? "flex" : "none";
  }
};

window.showToast = function (message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
};

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

// Export for debugging
window.App = App;
window.AppConfig = AppConfig;
