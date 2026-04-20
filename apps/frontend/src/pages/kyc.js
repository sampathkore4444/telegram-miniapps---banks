/**
 * KYC (Know Your Customer) Page
 * Progressive KYC onboarding flow
 */

const KYCPage = {
  currentStep: 1,
  totalSteps: 4,

  /**
   * Render KYC page
   * @param {object} params - Page parameters
   * @param {function} callback - Callback to render HTML
   */
  render(params, callback) {
    const html = `
            ${this.renderProgress()}
            ${this.renderCurrentStep()}
        `;

    callback(html);
    this.bindEvents();
  },

  /**
   * Render progress bar
   * @returns {string}
   */
  renderProgress() {
    const progress = (this.currentStep / this.totalSteps) * 100;

    return `
            <div class="card mb-lg">
                <div class="kyc-progress">
                    <div class="progress-steps">
                        ${[1, 2, 3, 4]
                          .map(
                            (step) => `
                            <div class="progress-step ${step < this.currentStep ? "completed" : ""} ${step === this.currentStep ? "active" : ""}">
                                <div class="step-circle">
                                    ${
                                      step < this.currentStep
                                        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
                                        : step
                                    }
                                </div>
                                <span class="step-label">${this.getStepLabel(step)}</span>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
            </div>
        `;
  },

  /**
   * Get step label
   * @param {number} step - Step number
   * @returns {string}
   */
  getStepLabel(step) {
    const labels = {
      1: "Personal",
      2: "ID Verify",
      3: "Selfie",
      4: "Complete",
    };
    return labels[step];
  },

  /**
   * Render current step
   * @returns {string}
   */
  renderCurrentStep() {
    const steps = {
      1: this.renderPersonalInfo(),
      2: this.renderIDVerification(),
      3: this.renderSelfieVerification(),
      4: this.renderCompletion(),
    };

    return steps[this.currentStep];
  },

  /**
   * Render personal info step
   * @returns {string}
   */
  renderPersonalInfo() {
    return `
            <div class="card">
                <h3 class="mb-lg">Personal Information</h3>
                <form id="kycForm">
                    <div class="form-group">
                        <label class="form-label">Full Name (as on ID)</label>
                        <input type="text" class="form-input" name="full_name" placeholder="Enter your full name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date of Birth</label>
                        <input type="date" class="form-input" name="dob" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Gender</label>
                        <select class="form-input" name="gender" required>
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Address</label>
                        <input type="text" class="form-input" name="address" placeholder="Enter your address" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Occupation</label>
                        <select class="form-input" name="occupation" required>
                            <option value="">Select occupation</option>
                            <option value="salaried">Salaried Employee</option>
                            <option value="self_employed">Self Employed</option>
                            <option value="business_owner">Business Owner</option>
                            <option value="student">Student</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">
                        Continue
                    </button>
                </form>
            </div>
        `;
  },

  /**
   * Render ID verification step
   * @returns {string}
   */
  renderIDVerification() {
    return `
            <div class="card">
                <h3 class="mb-lg">Verify Your ID</h3>
                <div class="text-center mb-lg">
                    <div class="id-preview">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" stroke-width="2">
                            <rect x="3" y="4" width="18" height="14" rx="2" ry="2"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                            <circle cx="8" cy="15" r="2"/>
                        </svg>
                    </div>
                    <p class="text-muted mt-md">Take a clear photo of your ID (National ID, Passport, or Driver's License)</p>
                </div>
                <div class="upload-options">
                    <button class="btn btn-outline btn-block mb-md" id="uploadIdBtn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Upload ID Image
                    </button>
                    <button class="btn btn-primary btn-block" id="captureIdBtn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                        </svg>
                        Take Photo
                    </button>
                </div>
                <button class="btn btn-ghost btn-block mt-lg" id="skipIdBtn">
                    Skip for Now
                </button>
            </div>
        `;
  },

  /**
   * Render selfie verification step
   * @returns {string}
   */
  renderSelfieVerification() {
    return `
            <div class="card">
                <h3 class="mb-lg">Take a Selfie</h3>
                <div class="text-center mb-lg">
                    <div class="selfie-preview">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <div class="selfie-guide"></div>
                    </div>
                    <p class="text-muted mt-md">Position your face within the circle and take a clear selfie</p>
                </div>
                <button class="btn btn-primary btn-block" id="captureSelfieBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                    </svg>
                    Capture Selfie
                </button>
            </div>
        `;
  },

  /**
   * Render completion step
   * @returns {string}
   */
  renderCompletion() {
    return `
            <div class="card text-center">
                <div class="kyc-success-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                </div>
                <h2 class="mt-lg">Verification Complete!</h2>
                <p class="text-muted mt-md">Your identity has been verified successfully. You now have full access to all features.</p>
                <div class="kyc-benefits mt-lg">
                    <div class="benefit-item">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>Higher loan limits</span>
                    </div>
                    <div class="benefit-item">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>Instant transfers</span>
                    </div>
                    <div class="benefit-item">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>Priority support</span>
                    </div>
                </div>
                <button class="btn btn-primary btn-block mt-xl" id="doneKycBtn">
                    Continue to App
                </button>
            </div>
        `;
  },

  /**
   * Bind page events
   */
  bindEvents() {
    // Form submission
    const form = document.getElementById("kycForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.nextStep();
      });
    }

    // Upload buttons
    const uploadBtn = document.getElementById("uploadIdBtn");
    if (uploadBtn) {
      uploadBtn.addEventListener("click", () => {
        window.showToast("Upload feature coming soon", "info");
      });
    }

    const captureBtn = document.getElementById("captureIdBtn");
    if (captureBtn) {
      captureBtn.addEventListener("click", () => {
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.openScanQrPopup();
        } else {
          window.showToast("Camera coming soon", "info");
        }
      });
    }

    const skipBtn = document.getElementById("skipIdBtn");
    if (skipBtn) {
      skipBtn.addEventListener("click", () => {
        this.nextStep();
      });
    }

    const selfieBtn = document.getElementById("captureSelfieBtn");
    if (selfieBtn) {
      selfieBtn.addEventListener("click", () => {
        window.showToast("Selfie capture coming soon", "info");
      });
    }

    const doneBtn = document.getElementById("doneKycBtn");
    if (doneBtn) {
      doneBtn.addEventListener("click", () => {
        store.setCurrentPage("home");
      });
    }
  },

  /**
   * Go to next step
   */
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.render({}, (html) => {
        const main = document.getElementById("main");
        if (main) main.innerHTML = html;
        this.bindEvents();
      });
    }
  },

  /**
   * Go to previous step
   */
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.render({}, (html) => {
        const main = document.getElementById("main");
        if (main) main.innerHTML = html;
        this.bindEvents();
      });
    }
  },
};

// Export
window.KYCPage = KYCPage;
