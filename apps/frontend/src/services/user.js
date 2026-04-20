/**
 * User Service - User API
 * Handles user profile, accounts, and related operations
 */

const UserService = {
  /**
   * Get current user profile
   * @returns {Promise}
   */
  async getProfile() {
    const response = await api.get("/users/me");
    store.setUser(response);
    return response;
  },

  /**
   * Update user profile
   * @param {object} data - Profile data
   * @returns {Promise}
   */
  async updateProfile(data) {
    const response = await api.patch("/users/me", data);
    store.setUser(response);
    return response;
  },

  /**
   * Get user accounts
   * @returns {Promise}
   */
  async getAccounts() {
    const response = await api.get("/users/me/accounts");
    store.setAccounts(response.accounts || []);
    return response;
  },

  /**
   * Get account by ID
   * @param {string} accountId - Account ID
   * @returns {Promise}
   */
  async getAccount(accountId) {
    const response = await api.get(`/users/me/accounts/${accountId}`);
    store.setSelectedAccount(response);
    return response;
  },

  /**
   * Get account transactions
   * @param {string} accountId - Account ID
   * @param {object} params - Query params
   * @returns {Promise}
   */
  async getTransactions(accountId, params = {}) {
    const response = await api.get(
      `/users/me/accounts/${accountId}/transactions`,
      params,
    );
    return response;
  },

  /**
   * Get user loans
   * @returns {Promise}
   */
  async getLoans() {
    const response = await api.get("/users/me/loans");
    store.setLoans(response.loans || []);
    return response;
  },

  /**
   * Get loan by ID
   * @param {string} loanId - Loan ID
   * @returns {Promise}
   */
  async getLoan(loanId) {
    const response = await api.get(`/users/me/loans/${loanId}`);
    store.setActiveLoan(response);
    return response;
  },

  /**
   * Apply for a new loan
   * @param {object} data - Loan application data
   * @returns {Promise}
   */
  async applyForLoan(data) {
    store.setLoading(true);
    try {
      const response = await api.post("/users/me/loans", data);
      return response;
    } finally {
      store.setLoading(false);
    }
  },

  /**
   * Check loan eligibility
   * @param {object} data - Eligibility check data
   * @returns {Promise}
   */
  async checkEligibility(data) {
    const response = await api.post("/users/me/loans/eligibility", data);
    return response;
  },

  /**
   * Get user wallet
   * @returns {Promise}
   */
  async getWallet() {
    const response = await api.get("/users/me/wallet");
    store.setWallet(response);
    if (response.balance !== undefined) {
      store.setBalance(response.balance);
    }
    return response;
  },

  /**
   * Get referral info
   * @returns {Promise}
   */
  async getReferral() {
    const response = await api.get("/users/me/referral");
    store.setReferralCode(response.code);
    store.setReferrals(response.referrals || []);
    return response;
  },

  /**
   * Get user rewards
   * @returns {Promise}
   */
  async getRewards() {
    const response = await api.get("/users/me/rewards");
    return response;
  },

  /**
   * Get notifications
   * @param {object} params - Query params
   * @returns {Promise}
   */
  async getNotifications(params = {}) {
    const response = await api.get("/users/me/notifications", params);
    return response;
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise}
   */
  async markNotificationRead(notificationId) {
    const response = await api.patch(
      `/users/me/notifications/${notificationId}`,
      {
        read: true,
      },
    );
    return response;
  },

  /**
   * Upload KYC document
   * @param {File} file - Document file
   * @param {string} type - Document type
   * @returns {Promise}
   */
  async uploadKYC(file, type) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await fetch(`${api.baseURL}/users/me/kyc`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: formData,
    });

    return response.json();
  },

  /**
   * Get KYC status
   * @returns {Promise}
   */
  async getKYCStatus() {
    const response = await api.get("/users/me/kyc/status");
    return response;
  },

  /**
   * Complete KYC
   * @param {object} data - KYC data
   * @returns {Promise}
   */
  async completeKYC(data) {
    store.setLoading(true);
    try {
      const response = await api.post("/users/me/kyc", data);
      return response;
    } finally {
      store.setLoading(false);
    }
  },
};

// Export for use in other modules
window.UserService = UserService;
