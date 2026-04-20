/**
 * Auth Service - Authentication API
 * Handles user authentication
 */

const AuthService = {
  /**
   * Login with phone and OTP
   * @param {string} phone - Phone number
   * @param {string} otp - One-time password
   * @returns {Promise}
   */
  async login(phone, otp) {
    store.setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        phone,
        otp_code: otp,
      });

      // Set token and user
      if (response.access_token) {
        api.setToken(response.access_token);
        store.setUser(response.user);
        store.persist();
      }

      return response;
    } finally {
      store.setLoading(false);
    }
  },

  /**
   * Request OTP
   * @param {string} phone - Phone number
   * @returns {Promise}
   */
  async requestOtp(phone) {
    store.setLoading(true);
    try {
      const response = await api.post("/auth/otp/request", {
        phone,
      });
      return response;
    } finally {
      store.setLoading(false);
    }
  },

  /**
   * Register new user
   * @param {object} data - User registration data
   * @returns {Promise}
   */
  async register(data) {
    store.setLoading(true);
    try {
      const response = await api.post("/auth/register", data);

      // Set token and user
      if (response.access_token) {
        api.setToken(response.access_token);
        store.setUser(response.user);
        store.persist();
      }

      return response;
    } finally {
      store.setLoading(false);
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // Ignore errors
    } finally {
      api.removeToken();
      store.clearUser();
      store.clear();
    }
  },

  /**
   * Refresh token
   * @returns {Promise}
   */
  async refresh() {
    try {
      const response = await api.post("/auth/refresh");
      if (response.access_token) {
        api.setToken(response.access_token);
      }
      return response;
    } catch (e) {
      this.logout();
      throw e;
    }
  },

  /**
   * Verify token
   * @returns {Promise}
   */
  async verify() {
    if (!api.isAuthenticated()) {
      return null;
    }

    try {
      const response = await api.get("/auth/me");
      store.setUser(response);
      return response;
    } catch (e) {
      store.clearUser();
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return api.isAuthenticated();
  },

  /**
   * Get Telegram init data for authentication
   * @returns {string}
   */
  getTelegramInitData() {
    if (window.Telegram && window.Telegram.WebApp) {
      return window.Telegram.WebApp.initData;
    }
    return null;
  },

  /**
   * Login with Telegram
   * @returns {Promise}
   */
  async loginWithTelegram() {
    const initData = this.getTelegramInitData();
    if (!initData) {
      throw new Error("Telegram WebApp not found");
    }

    store.setLoading(true);
    try {
      const response = await api.post("/auth/telegram", {
        init_data: initData,
      });

      if (response.access_token) {
        api.setToken(response.access_token);
        store.setUser(response.user);
        store.persist();
      }

      return response;
    } finally {
      store.setLoading(false);
    }
  },
};

// Export for use in other modules
window.AuthService = AuthService;
