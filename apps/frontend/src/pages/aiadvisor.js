/**
 * AI Loan Advisor - Smart loan recommendations based on your profile
 */

// AI Analysis logic
function analyzeUserProfile() {
  return {
    creditScore: 720,
    monthlyIncome: 2500,
    existingLoans: 1,
    totalDebt: 500,
    employmentType: "full_time",
    kycStatus: "verified",
    accountAge: 6,
    spendingScore: 85,
  };
}

const LOAN_PRODUCTS = [
  {
    id: "personal_loan",
    name: "Personal Loan",
    icon: "👤",
    minAmount: 500,
    maxAmount: 5000,
    minTerm: 3,
    maxTerm: 24,
    baseRate: 3.5,
    description: "For any personal expenses",
    requirements: ["Stable income", "Valid ID"],
    bestFor: ["Debt consolidation", "Home improvement", "Medical expenses"],
  },
  {
    id: "salary_advance",
    name: "Salary Advance",
    icon: "💵",
    minAmount: 100,
    maxAmount: 1000,
    minTerm: 1,
    maxTerm: 3,
    baseRate: 2.0,
    description: "Quick cash before payday",
    requirements: ["Salary account", "3+ months employment"],
    bestFor: ["Emergency cash", "Short-term needs"],
  },
  {
    id: "business_loan",
    name: "Business Loan",
    icon: "🏪",
    minAmount: 1000,
    maxAmount: 15000,
    minTerm: 6,
    maxTerm: 36,
    baseRate: 4.5,
    description: "Grow your business",
    requirements: ["Business registration", "6+ months operation"],
    bestFor: ["Inventory", "Equipment", "Expansion"],
  },
  {
    id: "education_loan",
    name: "Education Loan",
    icon: "🎓",
    minAmount: 500,
    maxAmount: 10000,
    minTerm: 6,
    maxTerm: 48,
    baseRate: 2.5,
    description: "Invest in your future",
    requirements: ["Enrollment proof", "Good academic standing"],
    bestFor: ["Tuition", "Courses", "Certification"],
  },
  {
    id: "home_renovation",
    name: "Home Improvement",
    icon: "🏠",
    minAmount: 1000,
    maxAmount: 8000,
    minTerm: 12,
    maxTerm: 36,
    baseRate: 3.0,
    description: "Upgrade your living space",
    requirements: ["Home ownership or rental", "Valid ID"],
    bestFor: ["Renovation", "Furniture", "Appliances"],
  },
];

function calculateMatchScore(product, userProfile) {
  let score = 50;
  const reasons = [];

  // Check credit score impact
  if (userProfile.creditScore >= 700) {
    score += 20;
    reasons.push("Excellent credit score");
  } else if (userProfile.creditScore >= 600) {
    score += 10;
    reasons.push("Good credit score");
  }

  // Check income
  if (userProfile.monthlyIncome >= 2000) {
    score += 15;
    reasons.push("Stable income");
  }

  // Check existing loans (less is better)
  if (userProfile.existingLoans === 0) {
    score += 10;
    reasons.push("No existing loans");
  } else if (userProfile.existingLoans < 2) {
    score += 5;
  }

  // Check employment
  if (userProfile.employmentType === "full_time") {
    score += 10;
    reasons.push("Full-time employment");
  }

  // Check KYC
  if (userProfile.kycStatus === "verified") {
    score += 5;
    reasons.push("Verified identity");
  }

  // Check account age
  if (userProfile.accountAge >= 3) {
    score += 5;
    reasons.push("Established account");
  }

  return {
    score: Math.min(95, score),
    reasons,
  };
}

function calculateInterestRate(baseRate, userProfile) {
  let rate = baseRate;

  // Adjust based on credit score
  if (userProfile.creditScore >= 800) {
    rate -= 1.0;
  } else if (userProfile.creditScore >= 700) {
    rate -= 0.5;
  } else if (userProfile.creditScore < 600) {
    rate += 1.0;
  }

  return Math.max(1.0, rate);
}

export function renderAIAdvisorPage() {
  const userProfile = analyzeUserProfile();
  const products = LOAN_PRODUCTS.map((product) => {
    const match = calculateMatchScore(product, userProfile);
    const interestRate = calculateInterestRate(product.baseRate, userProfile);
    const maxAmount = Math.min(
      product.maxAmount,
      userProfile.monthlyIncome * 3,
    );

    return {
      ...product,
      matchScore: match.score,
      reasons: match.reasons,
      interestRate,
      recommendedAmount: maxAmount,
      term: product.maxTerm,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  return `
    <div class="page aiadvisor-page">
      <div class="page-header">
        <button class="back-btn" onclick="window.navigateTo('home')">
          ← Back
        </button>
        <h1>AI Loan Advisor</h1>
      </div>
      
      <div class="aiadvisor-container">
        <div class="analysis-card">
          <div class="analysis-header">
            <div class="ai-icon">🤖</div>
            <div class="analysis-title">
              <h2>Analyzing Your Profile</h2>
              <p>Based on your financial data</p>
            </div>
          </div>
          
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">${userProfile.creditScore}</span>
              <span class="stat-label">Credit Score</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">$${userProfile.monthlyIncome}</span>
              <span class="stat-label">Monthly Income</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${userProfile.existingLoans}</span>
              <span class="stat-label">Active Loans</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${userProfile.accountAge}mo</span>
              <span class="stat-label">Account Age</span>
            </div>
          </div>
        </div>
        
        <div class="recommendations-header">
          <h3>Recommended Loans</h3>
          <p>Personalized just for you</p>
        </div>
        
        <div class="products-list">
          ${products
            .map(
              (product, index) => `
            <div class="product-card ${product.matchScore >= 70 ? "top-pick" : ""}">
              ${product.matchScore >= 70 && index === 0 ? '<span class="top-badge">🏆 Top Pick</span>' : ""}
              
              <div class="product-header">
                <div class="product-icon">${product.icon}</div>
                <div class="product-info">
                  <h4>${product.name}</h4>
                  <p>${product.description}</p>
                </div>
                <div class="match-score ${product.matchScore >= 70 ? "high" : product.matchScore >= 50 ? "medium" : "low"}">
                  <span class="score-value">${product.matchScore}%</span>
                  <span class="score-label">Match</span>
                </div>
              </div>
              
              <div class="product-details">
                <div class="detail-row">
                  <span class="detail-label">Interest Rate</span>
                  <span class="detail-value highlight">${product.interestRate}% APR</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Loan Amount</span>
                  <span class="detail-value">$${product.minAmount} - $${product.recommendedAmount}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Tenure</span>
                  <span class="detail-value">${product.minTerm} - ${product.term} months</span>
                </div>
              </div>
              
              <div class="ai-reasons">
                <p class="reasons-title">🤖 Why recommended:</p>
                <ul>
                  ${product.reasons
                    .slice(0, 3)
                    .map(
                      (reason) => `
                    <li>${reason}</li>
                  `,
                    )
                    .join("")}
                </ul>
              </div>
              
              <div class="product-actions">
                <button class="btn btn-primary" onclick="window.applyAIProduct('${product.id}', ${product.recommendedAmount})">
                  Apply Now
                </button>
                <button class="btn btn-outline" onclick="window.viewAIDetails('${product.id}')">
                  Details
                </button>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div class="tips-card">
          <h3>💡 AI Tips</h3>
          <div class="tips-list">
            <div class="tip-item">
              <div class="tip-bullet">1</div>
              <p>Improve your credit score to get lower interest rates</p>
            </div>
            <div class="tip-item">
              <div class="tip-bullet">2</div>
              <p>Apply for smaller loans first to build history</p>
            </div>
            <div class="tip-item">
              <div class="tip-bullet">3</div>
              <p>Maintain stable income for better approval odds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Global functions
window.applyAIProduct = function (productId, amount) {
  window.showToast(
    `Applying for ${productId} loan of $${amount}...`,
    "success",
  );
  setTimeout(() => {
    window.navigateTo("loans");
  }, 1000);
};

window.viewAIDetails = function (productId) {
  const product = LOAN_PRODUCTS.find((p) => p.id === productId);
  if (product) {
    alert(
      `${product.name}\n\n${product.description}\n\nRequirements: ${product.requirements.join(", ")}\n\nBest for: ${product.bestFor.join(", ")}`,
    );
  }
};

export default { render: renderAIAdvisorPage };
