/**
 * Router - Simple Client-Side Router for Vanilla JS
 * Handles navigation between pages
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.mainElement = null;
    this.backBtn = null;
    this.headerTitle = null;

    // Bind to window for popstate
    window.addEventListener("popstate", () => this.handleRoute());
  }

  /**
   * Initialize the router
   * @param {string} mainId - ID of the main content element
   * @param {string} backBtnId - ID of the back button
   * @param {string} headerTitleId - ID of the header title
   */
  init(mainId, backBtnId, headerTitleId) {
    this.mainElement = document.getElementById(mainId);
    this.backBtn = document.getElementById(backBtnId);
    this.headerTitle = document.getElementById(headerTitleId);

    // Handle back button click
    if (this.backBtn) {
      this.backBtn.addEventListener("click", () => this.goBack());
    }

    // Initial route
    this.handleRoute();
  }

  /**
   * Register a route
   * @param {string} path - Route path
   * @param {object} config - Route configuration
   */
  register(path, config) {
    this.routes.set(path, config);
  }

  /**
   * Navigate to a path
   * @param {string} path - Target path
   * @param {object} params - Route parameters
   */
  navigate(path, params = {}) {
    // Update URL without reloading
    const url = params
      ? `${path}?${new URLSearchParams(params).toString()}`
      : path;
    window.history.pushState({ path, params }, "", url);
    this.handleRoute(params);
  }

  /**
   * Handle route change
   * @param {object} params - Additional parameters
   */
  handleRoute(params = {}) {
    const path = window.location.pathname || "/";
    const searchParams = new URLSearchParams(window.location.search);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Merge query params into params
    const mergedParams = { ...queryParams, ...params };

    // Find matching route
    let matchedRoute = null;
    let matchedPath = "/";

    for (const [routePath, config] of this.routes) {
      if (this.matchPath(routePath, path)) {
        matchedRoute = config;
        matchedPath = routePath;
        break;
      }
    }

    if (matchedRoute) {
      this.currentRoute = matchedPath;
      this.renderRoute(matchedRoute, mergedParams);
    } else {
      // Default to home
      this.renderRoute(this.routes.get("/"), mergedParams);
    }
  }

  /**
   * Match route path
   * @param {string} routePath - Registered route path
   * @param {string} actualPath - Actual URL path
   * @returns {boolean}
   */
  matchPath(routePath, actualPath) {
    // Exact match
    if (routePath === actualPath) return true;

    // Handle named routes
    if (routePath.startsWith(":")) {
      return true; // Match any
    }

    return false;
  }

  /**
   * Render the current route
   * @param {object} config - Route configuration
   * @param {object} params - Route parameters
   */
  renderRoute(config, params) {
    if (!config || !this.mainElement) return;

    // Update header
    if (config.headerTitle && this.headerTitle) {
      this.headerTitle.textContent = config.headerTitle;
    }

    // Show/hide back button
    if (this.backBtn) {
      this.backBtn.style.display = config.showBack ? "flex" : "none";
    }

    // Render page content
    if (config.page) {
      config.page(params, (html) => {
        this.mainElement.innerHTML = html;

        // Initialize page scripts after render
        if (config.onMount) {
          config.onMount(params);
        }
      });
    }
  }

  /**
   * Go back to previous route
   */
  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.navigate("/");
    }
  }

  /**
   * Get current route path
   * @returns {string}
   */
  getCurrentRoute() {
    return this.currentRoute;
  }
}

// Create router instance
const router = new Router();

// Export for use in other modules
window.Router = Router;
window.router = router;
