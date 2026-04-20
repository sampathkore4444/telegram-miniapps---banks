/**
 * API - HTTP Request Utility
 * Handles all API calls to the backend
 */

class ApiClient {
  constructor() {
    this.baseURL = "/api/v1";
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  /**
   * Set authorization token
   * @param {string} token - JWT token
   */
  setToken(token) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("auth_token", token);
  }

  /**
   * Remove authorization token
   */
  removeToken() {
    delete this.defaultHeaders["Authorization"];
    localStorage.removeItem("auth_token");
  }

  /**
   * Get stored token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem("auth_token") || null;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Make HTTP request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @returns {Promise}
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: options.method || "GET",
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      credentials: "include",
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          this.removeToken();
          window.dispatchEvent(new CustomEvent("auth:logout"));
        }
        throw new ApiError(
          data.detail || "Request failed",
          response.status,
          data,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Network error", 0, { message: error.message });
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {object} params - Query parameters
   * @returns {Promise}
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: "GET" });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   * @returns {Promise}
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: data,
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   * @returns {Promise}
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: data,
    });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   * @returns {Promise}
   */
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      body: data,
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise}
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

/**
 * Custom API Error
 */
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Create API instance
const api = new ApiClient();

// Export for use in other modules
window.ApiClient = ApiClient;
window.ApiError = ApiError;
window.api = api;
