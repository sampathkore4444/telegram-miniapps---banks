/**
 * Leads Page - Lead Generation & Product Comparison
 * Captures user interest in financial products for partner banks
 */

import { navigateTo } from "../utils/router.js";
import { api } from "../utils/api.js";
import { store } from "../store/app.js";

// Lead qualification questions
const qualificationQuestions = [
  {
    id: "loan_purpose",
    question: "What do you need the loan for?",
    type: "select",
    options: [
      { value: "personal", label: "Personal expenses" },
      { value: "business", label: "Business capital" },
      { value: "home_improvement", label: "Home improvement" },
      { value: "debt_consolidation", label: "Debt consolidation" },
      { value: "education", label: "Education/Fees" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "monthly_income",
    question: "What is your monthly income?",
    type: "select",
    options: [
      { value: "under_300", label: "Under $300" },
      { value: "300_500", label: "$300 - $500" },
      { value: "500_1000", label: "$500 - $1,000" },
      { value: "1000_2000", label: "$1,000 - $2,000" },
      { value: "over_2000", label: "Over $2,000" },
    ],
  },
  {
    id: "employment_type",
    question: "What is your employment type?",
    type: "select",
    options: [
      { value: "salaried", label: "Salaried employee" },
      { value: "business_owner", label: "Business owner" },
      { value: "self_employed", label: "Self-employed/Freelancer" },
      { value: "retired", label: "Retired" },
    ],
  },
  {
    id: "loan_amount",
    question: "How much do you need?",
    type: "select",
    options: [
      { value: "under_500", label: "Under $500" },
      { value: "500_1000", label: "$500 - $1,000" },
      { value: "1000_3000", label: "$1,000 - $3,000" },
      { value: "3000_5000", label: "$3,000 - $5,000" },
      { value: "over_5000", label: "Over $5,000" },
    ],
  },
  {
    id: "credit_history",
    question: "What is your credit history?",
    type: "select",
    options: [
      { value: "excellent", label: "Excellent (750+)" },
      { value: "good", label: "Good (700-749)" },
      { value: "fair", label: "Fair (650-699)" },
      { value: "poor", label: "Poor (Below 650)" },
      { value: "no_credit", label: "No credit history" },
    ],
  },
];

// Partner bank offers (mock data)
const partnerOffers = [
  {
    id: "bank_1",
    bank_name: "ABC Bank",
    logo: "🏦",
    product_name: "Personal Loan",
    min_rate: 1.5,
    max_rate: 2.5,
    max_amount: 5000,
    processing_fee: 0,
    features: ["Quick approval", "No collateral", "Flexible tenure"],
  },
  {
    id: "bank_2",
    bank_name: "XYZ Microfinance",
    logo: "💰",
    product_name: "Micro Loan",
    min_rate: 2.0,
    max_rate: 3.0,
    max_amount: 2000,
    processing_fee: 25,
    features: ["Same-day approval", "Small amounts", "Daily options"],
  },
  {
    id: "bank_3",
    bank_name: "QuickCash",
    logo: "⚡",
    product_name: "Salary Advance",
    min_rate: 1.0,
    max_rate: 1.5,
    max_amount: 1000,
    processing_fee: 0,
    features: ["Instant", "Limit increases", "Salary-based"],
  },
];

export function renderLeadsPage() {
  const state = store.getState();
  const isAuthenticated = state.isAuthenticated;

  if (!isAuthenticated) {
    return renderLeadGenerationPage();
  }

  return renderAuthenticatedLeadsPage(state);
}

function renderLeadGenerationPage() {
  const state = store.getState();
  const leads = state.leads || {};
  const currentStep = leads.step || 0;

  let content = "";

  if (leads.completed) {
    // Show matched offers
    content = renderMatchedOffers();
  } else if (leads.matched && leads.matched.length > 0) {
    // Show results
    content = renderLeadResults(leads.matched);
  } else {
    // Show qualification quiz
    content = renderLeadQuiz(currentStep);
  }

  return `
        <div class="page leads-page">
            <div class="page-header">
                <button class="back-btn" onclick="window.navigateTo('home')">
                    ← Back
                </button>
                <h1>Compare Rates</h1>
            </div>
            ${content}
        </div>
    `;
}

function renderLeadQuiz(step) {
  const question = qualificationQuestions[step];
  if (!question) {
    return renderSubmitLeadForm();
  }

  const state = store.getState();
  const answers = state.leads?.answers || {};
  const currentAnswer = answers[question.id] || "";

  let optionsHtml = "";
  if (question.type === "select") {
    optionsHtml = question.options
      .map(
        (opt) => `
            <option value="${opt.value}" ${currentAnswer === opt.value ? "selected" : ""}>
                ${opt.label}
            </option>
        `,
      )
      .join("");
  }

  const progress = Math.round(
    ((step + 1) / qualificationQuestions.length) * 100,
  );

  return `
        <div class="lead-quiz">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <p class="progress-text">Question ${step + 1} of ${qualificationQuestions.length}</p>
            
            <div class="question-card">
                <h3>${question.question}</h3>
                <select id="lead-answer" class="form-select">
                    <option value="">Select an answer</option>
                    ${optionsHtml}
                </select>
            </div>
            
            <div class="quiz-actions">
                ${
                  step > 0
                    ? `
                    <button class="btn btn-secondary" onclick="window.leadPrevStep()">
                        ← Previous
                    </button>
                `
                    : ""
                }
                <button class="btn btn-primary" onclick="window.leadNextStep()">
                    ${step === qualificationQuestions.length - 1 ? "Find Matches →" : "Next →"}
                </button>
            </div>
            
            <div class="lead-reward-banner">
                🎁 Complete quiz to earn <strong>$5 reward</strong>
            </div>
        </div>
    `;
}

function renderSubmitLeadForm() {
  return `
        <div class="lead-form">
            <h3>Almost done!</h3>
            <p>Enter your contact to see matched offers</p>
            
            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="lead-phone" class="form-input" 
                    placeholder="+855..." value="">
            </div>
            
            <div class="form-group">
                <label>Name</label>
                <input type="text" id="lead-name" class="form-input" 
                    placeholder="Your name" value="">
            </div>
            
            <div class="agreement-text">
                <input type="checkbox" id="lead-agree" checked>
                <label for="lead-agree">
                    I agree to receive offers from partner banks
                </label>
            </div>
            
            <button class="btn btn-primary btn-block" onclick="window.submitLeadForm()">
                See My Matches →
            </button>
            
            <button class="btn btn-link" onclick="window.skipLeadForm()">
                Skip, just see offers →
            </button>
        </div>
    `;
}

function renderMatchedOffers() {
  const state = store.getState();
  const leads = state.leads || {};
  const matches = leads.matches || partnerOffers;

  return `
        <div class="matched-offers">
            <div class="success-banner">
                ✓ You've been matched with ${matches.length} lenders!
            </div>
            
            <h3>Your Best Options</h3>
            
            <div class="offers-list">
                ${matches.map((offer) => renderOfferCard(offer)).join("")}
            </div>
            
            <div class="lead-stats">
                <div class="stat">
                    <span class="stat-value">${matches.length}</span>
                    <span class="stat-label">Matched Offers</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${Math.min(...matches.map((o) => o.min_rate))}%</span>
                    <span class="stat-label">Lowest Rate</span>
                </div>
                <div class="stat">
                    <span class="stat-value">$${Math.max(...matches.map((o) => o.max_amount))}</span>
                    <span class="stat-label">Max Amount</span>
                </div>
            </div>
            
            <button class="btn btn-primary btn-block" onclick="window.applyToOffer('${matches[0].id}')">
                Apply to Best Offer
            </button>
            
            <div class="save-lead">
                <button class="btn btn-secondary" onclick="window.saveLeadForLater()">
                    💾 Save for Later
                </button>
            </div>
        </div>
    `;
}

function renderLeadResults(matches) {
  return `
        <div class="lead-results">
            <h3>We found ${matches.length} matching offers!</h3>
            
            <div class="offers-list">
                ${matches.map((offer) => renderOfferCard(offer)).join("")}
            </div>
            
            <button class="btn btn-primary btn-block" onclick="window.leadStartOver()">
                ← Start New Comparison
            </button>
        </div>
    `;
}

function renderOfferCard(offer) {
  return `
        <div class="offer-card">
            <div class="offer-header">
                <span class="bank-logo">${offer.logo}</span>
                <div class="bank-info">
                    <h4>${offer.bank_name}</h4>
                    <p>${offer.product_name}</p>
                </div>
                <div class="rate-badge">
                    ${offer.min_rate}% - ${offer.max_rate}% APR
                </div>
            </div>
            
            <div class="offer-details">
                <div class="detail">
                    <span class="label">Max Amount</span>
                    <span class="value">$${offer.max_amount}</span>
                </div>
                <div class="detail">
                    <span class="label">Processing Fee</span>
                    <span class="value">$${offer.processing_fee}</span>
                </div>
            </div>
            
            <div class="offer-features">
                ${offer.features.map((f) => `<span class="feature-tag">${f}</span>`).join("")}
            </div>
            
            <button class="btn btn-primary btn-sm" onclick="window.applyToOffer('${offer.id}')">
                Apply Now
            </button>
        </div>
    `;
}

function renderAuthenticatedLeadsPage(state) {
  const leads = state.leads || {};

  // Check if user has submitted leads
  const hasLeads = leads.submitted && leads.submitted.length > 0;

  return `
        <div class="page leads-page">
            <div class="page-header">
                <button class="back-btn" onclick="window.navigateTo('home')">
                    ← Back
                </button>
                <h1>Compare & Earn</h1>
            </div>
            
            ${hasLeads ? renderUserLeads(leads.submitted) : renderLeadGenerationPage()}
        </div>
    `;
}

function renderUserLeads(submittedLeads) {
  return `
        <div class="user-leads">
            <div class="leads-summary">
                <h3>Your Lead Submissions</h3>
                <p>Track your submitted leads and their status</p>
            </div>
            
            <div class="leads-list">
                ${submittedLeads
                  .map(
                    (lead) => `
                    <div class="lead-item">
                        <div class="lead-info">
                            <h4>${lead.product}</h4>
                            <p>Submitted: ${lead.submittedAt}</p>
                        </div>
                        <div class="lead-status status-${lead.status}">
                            ${lead.status}
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            
            <button class="btn btn-primary" onclick="window.leadStartOver()">
                Submit New Lead
            </button>
        </div>
    `;
}

// Global functions for event handlers
export function leadNextStep() {
  const state = store.getState();
  const leads = state.leads || {};
  const step = leads.step || 0;
  const answers = leads.answers || {};

  const answerEl = document.getElementById("lead-answer");
  if (answerEl && answerEl.value) {
    answers[qualificationQuestions[step].id] = answerEl.value;
  }

  if (step < qualificationQuestions.length - 1) {
    store.setState({
      leads: { ...leads, step: step + 1, answers },
    });
  } else {
    // Last question - submit lead form
    store.setState({
      leads: { ...leads, answers, step: "form" },
    });
  }

  renderPage();
}

export function leadPrevStep() {
  const state = store.getState();
  const leads = state.leads || {};
  const step = leads.step || 0;

  if (step > 0) {
    store.setState({
      leads: { ...leads, step: step - 1 },
    });
  }

  renderPage();
}

export async function submitLeadForm() {
  const phone = document.getElementById("lead-phone")?.value;
  const name = document.getElementById("lead-name")?.value;
  const agree = document.getElementById("lead-agree")?.checked;

  if (!phone || !name) {
    alert("Please fill in all fields");
    return;
  }

  if (!agree) {
    alert("Please agree to receive offers");
    return;
  }

  // Submit lead to backend
  try {
    const state = store.getState();
    const leads = state.leads || {};

    const response = await api.post("/leads", {
      phone,
      name,
      answers: leads.answers,
      source: "telegram_miniapp",
    });

    if (response.success) {
      // Award reward points
      store.setState({
        leads: {
          ...leads,
          completed: true,
          matches: partnerOffers,
          submitted: [
            {
              id: response.lead_id,
              product: "Multiple",
              status: "submitted",
              submittedAt: new Date().toLocaleDateString(),
            },
          ],
        },
      });

      // Show success
      alert("🎉 $5 reward credited to your wallet!");
    }
  } catch (error) {
    console.error("Lead submission error:", error);
    // Still show offers even if API fails
    const state = store.getState();
    store.setState({
      leads: {
        ...state.leads,
        completed: true,
        matches: partnerOffers,
      },
    });
  }

  renderPage();
}

export function skipLeadForm() {
  const state = store.getState();
  const leads = state.leads || {};

  store.setState({
    leads: {
      ...leads,
      completed: true,
      matches: partnerOffers,
    },
  });

  renderPage();
}

export function applyToOffer(offerId) {
  const offer = partnerOffers.find((o) => o.id === offerId);
  if (!offer) return;

  // Navigate to loan application with pre-filled data
  navigateTo("loans", {
    prefill: true,
    partner: offer.bank_name,
    product: offer.product_name,
  });
}

export function saveLeadForLater() {
  const state = store.getState();
  const leads = state.leads || {};

  // Save lead to backend for later
  api.post("/leads/save", {
    answers: leads.answers,
    matches: partnerOffers.map((o) => o.id),
  });

  alert("Lead saved! You can apply later from your profile.");
  navigateTo("home");
}

export function leadStartOver() {
  store.setState({
    leads: { step: 0, answers: {} },
  });

  renderPage();
}

function renderPage() {
  const container = document.getElementById("app");
  if (container) {
    container.innerHTML = renderLeadsPage();
  }
}

// Initialize page
export default function init() {
  // Reset step if not started
  const state = store.getState();
  if (!state.leads) {
    store.setState({ leads: { step: 0, answers: {} } });
  }

  return renderLeadsPage();
}
