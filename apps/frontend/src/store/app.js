/**
 * App Store - State Management
 * Simple event-based state management for the app
 */

class AppStore {
  constructor() {
    this.state = {
      // User state
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Account state
      accounts: [],
      selectedAccount: null,

      // Loan state
      loans: [],
      activeLoan: null,

      // UI state
      currentPage: "home",
      notifications: [],

      // Wallet state
      wallet: null,
      balance: 0,

      // Referral state
      referrals: [],
      referralCode: null,
    };

    this.listeners = new Map();
  }

  /**
   * Get current state
   * @param {string} key - State key
   * @returns {any}
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Get entire state
   * @returns {object}
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Set state
   * @param {string|object} key - State key or object
   * @param {any} value - State value
   */
  set(key, value) {
    if (typeof key === "object") {
      // Merge object into state
      this.state = { ...this.state, ...key };
    } else {
      this.state[key] = value;
    }

    // Notify listeners
    this.emit(key, this.state[key]);
  }

  /**
   * Update state using a reducer
   * @param {string} key - State key
   * @param {function} reducer - Reducer function
   */
  update(key, reducer) {
    const currentValue = this.state[key];
    const newValue = reducer(currentValue);
    this.state[key] = newValue;
    this.emit(key, newValue);
  }

  /**
   * Subscribe to state changes
   * @param {string} key - State key
   * @param {function} listener - Callback function
   * @returns {function} Unsubscribe function
   */
  subscribe(key, listener) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key).add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(key).delete(listener);
    };
  }

  /**
   * Emit state change to listeners
   * @param {string} key - State key
   * @param {any} value - New value
   */
  emit(key, value) {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach((listener) => listener(value));
    }

    // Also notify wildcard listeners
    const allListeners = this.listeners.get("*");
    if (allListeners) {
      allListeners.forEach((listener) => listener(key, value));
    }
  }

  /**
   * Set user data
   * @param {object} user - User data
   */
  setUser(user) {
    this.set({ user, isAuthenticated: !!user });
  }

  /**
   * Clear user data (logout)
   */
  clearUser() {
    this.set({
      user: null,
      isAuthenticated: false,
      accounts: [],
      selectedAccount: null,
      loans: [],
      activeLoan: null,
      wallet: null,
      referrals: [],
    });
  }

  /**
   * Set loading state
   * @param {boolean} isLoading - Loading state
   */
  setLoading(isLoading) {
    this.set({ isLoading });
  }

  /**
   * Set accounts
   * @param {array} accounts - Accounts array
   */
  setAccounts(accounts) {
    this.set({ accounts });
  }

  /**
   * Set selected account
   * @param {object} account - Selected account
   */
  setSelectedAccount(account) {
    this.set({ selectedAccount: account });
  }

  /**
   * Set loans
   * @param {array} loans - Loans array
   */
  setLoans(loans) {
    this.set({ loans });
  }

  /**
   * Set active loan
   * @param {object} loan - Active loan
   */
  setActiveLoan(loan) {
    this.set({ activeLoan: loan });
  }

  /**
   * Set wallet
   * @param {object} wallet - Wallet data
   */
  setWallet(wallet) {
    this.set({ wallet });
  }

  /**
   * Set balance
   * @param {number} balance - Balance amount
   */
  setBalance(balance) {
    this.set({ balance });
  }

  /**
   * Set referrals
   * @param {array} referrals - Referrals array
   */
  setReferrals(referrals) {
    this.set({ referrals });
  }

  /**
   * Set referral code
   * @param {string} code - Referral code
   */
  setReferralCode(code) {
    this.set({ referralCode: code });
  }

  /**
   * Set current page
   * @param {string} page - Page name
   */
  setCurrentPage(page) {
    this.set({ currentPage: page });
  }

  /**
   * Add notification
   * @param {object} notification - Notification object
   */
  addNotification(notification) {
    const notifications = [
      ...this.state.notifications,
      {
        ...notification,
        id: Date.now(),
      },
    ];
    this.set({ notifications });
  }

  /**
   * Remove notification
   * @param {number} id - Notification ID
   */
  removeNotification(id) {
    const notifications = this.state.notifications.filter((n) => n.id !== id);
    this.set({ notifications });
  }

  /**
   * Persist state to localStorage
   */
  persist() {
    const toPersist = {
      isAuthenticated: this.state.isAuthenticated,
      user: this.state.user,
      accounts: this.state.accounts,
    };
    localStorage.setItem("app_state", JSON.stringify(toPersist));
  }

  /**
   * Restore state from localStorage
   */
  restore() {
    try {
      const saved = localStorage.getItem("app_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        this.set(parsed);
      }
    } catch (e) {
      console.error("Failed to restore state:", e);
    }
  }

  /**
   * Clear persisted state
   */
  clear() {
    localStorage.removeItem("app_state");
  }
}

// Create store instance
const store = new AppStore();

// Export for use in other modules
window.AppStore = AppStore;
window.store = store;
