/**
 * Loan Calculator Page - EMI Calculator with Amortization Schedule
 */

import { navigateTo } from "../utils/router.js";

// Calculator state
let calculatorState = {
  principal: 1000,
  interestRate: 5, // Annual interest rate in %
  tenureMonths: 12,
};

// EMI Calculation
function calculateEMI(principal, annualRate, months) {
  if (principal <= 0 || months <= 0) return 0;

  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    return principal / months;
  }

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return emi;
}

// Generate amortization schedule
function generateAmortizationSchedule(principal, annualRate, months) {
  const emi = calculateEMI(principal, annualRate, months);
  const monthlyRate = annualRate / 12 / 100;

  let balance = principal;
  const schedule = [];

  for (let month = 1; month <= months; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = emi - interest;
    balance -= principalPaid;

    schedule.push({
      month,
      emi: emi.toFixed(2),
      principal: principalPaid.toFixed(2),
      interest: interest.toFixed(2),
      balance: Math.max(0, balance).toFixed(2),
    });
  }

  return schedule;
}

// Calculate total interest
function calculateTotalInterest(principal, annualRate, months) {
  const emi = calculateEMI(principal, annualRate, months);
  return emi * months - principal;
}

export function renderCalculatorPage() {
  const { principal, interestRate, tenureMonths } = calculatorState;

  const emi = calculateEMI(principal, interestRate, tenureMonths);
  const totalInterest = calculateTotalInterest(
    principal,
    interestRate,
    tenureMonths,
  );
  const totalPayment = emi * tenureMonths;

  // Generate preview schedule (first 3 and last 3 months)
  const fullSchedule = generateAmortizationSchedule(
    principal,
    interestRate,
    tenureMonths,
  );
  let schedulePreview = [];

  if (tenureMonths <= 6) {
    schedulePreview = fullSchedule;
  } else {
    schedulePreview = [
      ...fullSchedule.slice(0, 3),
      {
        month: "...",
        emi: "...",
        principal: "...",
        interest: "...",
        balance: "...",
      },
      ...fullSchedule.slice(-3),
    ];
  }

  return `
    <div class="page calculator-page">
      <div class="page-header">
        <button class="back-btn" onclick="window.navigateTo('home')">
          ← Back
        </button>
        <h1>Loan Calculator</h1>
      </div>
      
      <div class="calculator-container">
        <div class="calculator-card">
          <h3>Loan Details</h3>
          
          <div class="form-group">
            <label class="form-label">Loan Amount ($)</label>
            <input 
              type="number" 
              class="form-input"
              value="${principal}" 
              onchange="window.updateCalculator('principal', this.value)"
              min="100"
              max="100000"
              step="100"
            />
            <input 
              type="range" 
              class="slider"
              value="${principal}"
              min="100"
              max="10000"
              step="100"
              oninput="window.updateCalculator('principal', this.value)"
            />
            <div class="slider-labels">
              <span>$100</span>
              <span>$10,000</span>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Annual Interest Rate (%)</label>
            <input 
              type="number" 
              class="form-input"
              value="${interestRate}" 
              onchange="window.updateCalculator('interestRate', this.value)"
              min="0"
              max="30"
              step="0.5"
            />
            <input 
              type="range" 
              class="slider"
              value="${interestRate}"
              min="0"
              max="20"
              step="0.5"
              oninput="window.updateCalculator('interestRate', this.value)"
            />
            <div class="slider-labels">
              <span>0%</span>
              <span>20%</span>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Tenure (Months)</label>
            <input 
              type="number" 
              class="form-input"
              value="${tenureMonths}" 
              onchange="window.updateCalculator('tenureMonths', this.value)"
              min="1"
              max="60"
              step="1"
            />
            <input 
              type="range" 
              class="slider"
              value="${tenureMonths}"
              min="1"
              max="36"
              step="1"
              oninput="window.updateCalculator('tenureMonths', this.value)"
            />
            <div class="slider-labels">
              <span>1 month</span>
              <span>36 months</span>
            </div>
          </div>
        </div>
        
        <div class="results-card">
          <h3>EMI Results</h3>
          
          <div class="result-row">
            <span class="result-label">Monthly EMI</span>
            <span class="result-value emi-value">$${emi.toFixed(2)}</span>
          </div>
          
          <div class="result-row">
            <span class="result-label">Total Interest</span>
            <span class="result-value">$${totalInterest.toFixed(2)}</span>
          </div>
          
          <div class="result-row">
            <span class="result-label">Total Payment</span>
            <span class="result-value">$${totalPayment.toFixed(2)}</span>
          </div>
          
          <div class="payment-breakdown">
            <div class="breakdown-bar">
              <div 
                class="principal-bar" 
                style="width: ${(principal / totalPayment) * 100}%"
              ></div>
              <div 
                class="interest-bar" 
                style="width: ${(totalInterest / totalPayment) * 100}%"
              ></div>
            </div>
            <div class="breakdown-labels">
              <span>Principal: $${principal.toFixed(0)}</span>
              <span>Interest: $${totalInterest.toFixed(0)}</span>
            </div>
          </div>
        </div>
        
        <div class="schedule-card">
          <div class="schedule-header">
            <h3>Amortization Schedule</h3>
            <button class="btn btn-sm" onclick="window.toggleFullSchedule()">
              ${tenureMonths <= 12 ? "Hide" : "Expand"}
            </button>
          </div>
          
          <div class="schedule-table">
            <div class="table-header">
              <span>#</span>
              <span>Principal</span>
              <span>Interest</span>
              <span>EMI</span>
              <span>Balance</span>
            </div>
            
            ${schedulePreview
              .map(
                (row) => `
              <div class="table-row">
                <span>${row.month}</span>
                <span>$${row.principal}</span>
                <span>$${row.interest}</span>
                <span>$${row.emi}</span>
                <span>$${row.balance}</span>
              </div>
            `,
              )
              .join("")}
          </div>
          
          ${
            tenureMonths > 6 && !window.showFullSchedule
              ? `
            <p class="schedule-note">
              Showing first 3 and last 3 months. Click "Expand" to see full schedule.
            </p>
          `
              : ""
          }
        </div>
        
        <div class="action-buttons">
          <button class="btn btn-primary btn-block" onclick="window.applyForLoan(${principal})">
            Apply for $${principal} Loan
          </button>
        </div>
      </div>
    </div>
  `;
}

// Global functions
window.updateCalculator = function (field, value) {
  if (field === "principal") {
    calculatorState.principal = Math.max(100, parseFloat(value) || 100);
  } else if (field === "interestRate") {
    calculatorState.interestRate = Math.max(0, parseFloat(value) || 0);
  } else if (field === "tenureMonths") {
    calculatorState.tenureMonths = Math.max(1, parseInt(value) || 1);
  }

  // Re-render
  window.loadPage("calculator");
};

window.toggleFullSchedule = function () {
  const principal = calculatorState.principal;
  const interestRate = calculatorState.interestRate;
  const tenureMonths = calculatorState.tenureMonths;

  if (window.showFullSchedule) {
    window.showFullSchedule = false;
  } else {
    window.showFullSchedule = true;
  }

  window.loadPage("calculator");
};

window.applyForLoan = function (amount) {
  // Store the loan amount and navigate to loan application
  if (window.store && window.store.setState) {
    window.store.setState({ loanAmount: amount });
  }

  navigateTo("loan");
};

window.showFullSchedule = false;

export default { render: renderCalculatorPage };
