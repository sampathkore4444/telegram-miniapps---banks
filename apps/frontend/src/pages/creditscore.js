/**
 * Credit Score Page - View and improve credit score
 */

// Mock credit score data
const CREDIT_FACTORS = [
  {
    id: "payment_history",
    name: "Payment History",
    icon: "📅",
    weight: 35,
    status: "good",
    description: "Your loan repayments are on time",
  },
  {
    id: "credit_utilization",
    name: "Credit Utilization",
    icon: "📊",
    weight: 30,
    status: "fair",
    description: "Using 45% of your credit limit",
  },
  {
    id: "credit_history",
    name: "Credit History",
    icon: "⏱️",
    weight: 15,
    status: "good",
    description: "6 months of credit history",
  },
  {
    id: "new_credit",
    name: "New Credit",
    icon: "🆕",
    weight: 10,
    status: "excellent",
    description: "No recent credit applications",
  },
  {
    id: "credit_mix",
    name: "Credit Mix",
    icon: "🎯",
    weight: 10,
    status: "fair",
    description: "Consider diversifying credit types",
  },
];

const IMPROVEMENT_TIPS = [
  {
    id: "tip_1",
    title: "Make Payments On Time",
    description: "Pay all your loan EMIs before the due date",
    impact: "+50 points",
    icon: "✅",
  },
  {
    id: "tip_2",
    title: "Reduce Credit Utilization",
    description: "Keep credit usage below 30% of your limit",
    impact: "+30 points",
    icon: "💳",
  },
  {
    id: "tip_3",
    title: "Don't Apply for Too Much Credit",
    description: "Space out your credit applications",
    impact: "+20 points",
    icon: "⏰",
  },
  {
    id: "tip_4",
    title: "Maintain Old Accounts",
    description: "Keep your oldest credit accounts open",
    impact: "+15 points",
    icon: "🏦",
  },
];

export function renderCreditScorePage() {
  // Mock user credit score
  const creditScore = 720;
  const scoreGrade = getGrade(creditScore);
  const scoreColor = getScoreColor(creditScore);

  // Calculate factor scores
  const factorScores = CREDIT_FACTORS.map((factor) => {
    const score = calculateFactorScore(factor, creditScore);
    return { ...factor, score };
  });

  return `
    <div class="page creditscore-page">
      <div class="page-header">
        <button class="back-btn" onclick="window.navigateTo('home')">
          ← Back
        </button>
        <h1>Credit Score</h1>
      </div>
      
      <div class="creditscore-container">
        <div class="score-card">
          <div class="score-circle" style="--score-color: ${scoreColor}">
            <svg viewBox="0 0 100 100">
              <circle class="score-bg" cx="50" cy="50" r="45" />
              <circle 
                class="score-progress" 
                cx="50" 
                cy="50" 
                r="45"
                style="stroke-dashoffset: ${283 - (283 * creditScore) / 850}"
              />
            </svg>
            <div class="score-value">
              <span class="score-number">${creditScore}</span>
              <span class="score-label">/${850}</span>
            </div>
          </div>
          
          <div class="score-info">
            <h2 class="score-grade ${scoreGrade.toLowerCase()}">${scoreGrade}</h2>
            <p class="score-description">${getGradeDescription(scoreGrade)}</p>
          </div>
          
          <div class="score-range">
            <div class="range-labels">
              <span>300</span>
              <span>580</span>
              <span>670</span>
              <span>740</span>
              <span>850</span>
            </div>
            <div class="range-bar">
              <div class="range-poor" style="width: 25%"></div>
              <div class="range-fair" style="width: 10%"></div>
              <div class="range-good" style="width: 15%"></div>
              <div class="range-very-good" style="width: 20%"></div>
              <div class="range-excellent" style="width: 30%"></div>
            </div>
            <div class="range-marker" style="left: ${((creditScore - 300) / 550) * 100}%">
              <div class="marker-line"></div>
              <span class="marker-label">You</span>
            </div>
          </div>
        </div>
        
        <div class="factors-card">
          <h3>Score Factors</h3>
          <div class="factors-list">
            ${factorScores
              .map(
                (factor) => `
              <div class="factor-item">
                <div class="factor-icon">${factor.icon}</div>
                <div class="factor-info">
                  <div class="factor-header">
                    <span class="factor-name">${factor.name}</span>
                    <span class="factor-weight">${factor.weight}%</span>
                  </div>
                  <p class="factor-description">${factor.description}</p>
                  <div class="factor-bar">
                    <div 
                      class="factor-fill ${factor.status}" 
                      style="width: ${factor.score}%"
                    ></div>
                  </div>
                </div>
                <div class="factor-status ${factor.status}">
                  ${getStatusIcon(factor.status)}
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
        
        <div class="tips-card">
          <h3>How to Improve</h3>
          <div class="tips-list">
            ${IMPROVEMENT_TIPS.map(
              (tip) => `
              <div class="tip-item">
                <div class="tip-icon">${tip.icon}</div>
                <div class="tip-info">
                  <h4>${tip.title}</h4>
                  <p>${tip.description}</p>
                </div>
                <div class="tip-impact">${tip.impact}</div>
              </div>
            `,
            ).join("")}
          </div>
        </div>
        
        <div class="actions-card">
          <button class="btn btn-primary btn-block" onclick="window.refreshCreditScore()">
            🔄 Refresh Score
          </button>
          <p class="refresh-note">Scores update monthly based on your account activity</p>
        </div>
      </div>
    </div>
  `;
}

function getGrade(score) {
  if (score >= 800) return "Excellent";
  if (score >= 740) return "Very Good";
  if (score >= 670) return "Good";
  if (score >= 580) return "Fair";
  return "Poor";
}

function getGradeDescription(grade) {
  const descriptions = {
    Excellent:
      "Your credit score is outstanding! You'll qualify for the best rates.",
    "Very Good": "Great score! You qualify for competitive interest rates.",
    Good: "Solid score. Most lenders will approve your applications.",
    Fair: "Decent score. Some lenders may charge higher rates.",
    Poor: "Needs improvement. Focus on making timely payments.",
  };
  return descriptions[grade] || "";
}

function getScoreColor(score) {
  if (score >= 800) return "#27AE60";
  if (score >= 740) return "#2ECC71";
  if (score >= 670) return "#F39C12";
  if (score >= 580) return "#E67E22";
  return "#E74C3C";
}

function calculateFactorScore(factor, totalScore) {
  // Simplified scoring based on total score and factor weight
  const baseScore = totalScore;
  switch (factor.status) {
    case "excellent":
      return Math.min(100, baseScore + 10);
    case "good":
      return Math.min(100, baseScore - 5);
    case "fair":
      return Math.min(100, baseScore - 15);
    case "poor":
      return Math.min(100, baseScore - 25);
    default:
      return 70;
  }
}

function getStatusIcon(status) {
  const icons = {
    excellent: "⭐",
    good: "✓",
    fair: "⚠",
    poor: "✗",
  };
  return icons[status] || "";
}

// Global functions
window.refreshCreditScore = function () {
  window.showToast("Refreshing your credit score...", "info");

  setTimeout(() => {
    window.showToast("Credit score updated!", "success");
    window.loadPage("creditscore");
  }, 1500);
};

export default { render: renderCreditScorePage };
