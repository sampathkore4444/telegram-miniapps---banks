/**
 * Spin Wheel Page - Daily Lucky Spin
 * Users can spin daily to win coins/rewards
 */

import { navigateTo } from "../utils/router.js";
import { api } from "../utils/api.js";
import { store } from "../store/app.js";

// Wheel configuration
const WHEEL_SEGMENTS = [
  { label: "10 Coins", value: 10, color: "#FF6B6B", probability: 0.2 },
  { label: "50 Coins", value: 50, color: "#4ECDC4", probability: 0.1 },
  { label: "100 Coins", value: 100, color: "#45B7D1", probability: 0.05 },
  { label: "5 Coins", value: 5, color: "#96CEB4", probability: 0.25 },
  { label: "25 Coins", value: 25, color: "#FFEAA7", probability: 0.15 },
  { label: "200 Coins", value: 200, color: "#DDA0DD", probability: 0.03 },
  { label: "1 Coin", value: 1, color: "#B8B8B8", probability: 0.15 },
  { label: "75 Coins", value: 75, color: "#FFA07A", probability: 0.07 },
];

// Daily spin configuration
const DAILY_SPIN_RESET_HOURS = 24; // 24 hours between spins

export function renderSpinWheelPage() {
  const state = store.getState();
  const user = state.user;

  // Check if user can spin
  const canSpin = checkCanSpin(state);
  const spinsRemaining = canSpin ? 1 : 0;
  const lastSpinTime = state.spinWheel?.lastSpin || null;
  const totalCoins = user?.coins || 0;

  return `
        <div class="page spin-wheel-page">
            <div class="page-header">
                <button class="back-btn" onclick="window.navigateTo('home')">
                    ← Back
                </button>
                <h1>Daily Spin</h1>
            </div>
            
            <div class="spin-container">
                <div class="coin-balance">
                    <span class="coin-icon">🪙</span>
                    <span class="coin-amount">${totalCoins} Coins</span>
                </div>
                
                <div class="wheel-wrapper">
                    <div class="wheel-pointer">▼</div>
                    <canvas id="spinWheel" width="300" height="300"></canvas>
                    <div class="wheel-center" id="wheelCenter">
                        <span>SPIN</span>
                    </div>
                </div>
                
                <div class="spin-info">
                    ${
                      canSpin
                        ? `
                        <p class="spin-cta">Spin to win coins!</p>
                        <button class="btn btn-primary btn-spin" id="spinBtn" onclick="window.spinWheel()">
                            🎰 SPIN NOW
                        </button>
                    `
                        : `
                        <p class="spin-timer">
                            ⏰ Next spin in: <span id="countdown">${getCountdown(lastSpinTime)}</span>
                        </p>
                        <div class="spin-history">
                            <h4>Recent Wins</h4>
                            ${renderSpinHistory(state.spinWheel?.history || [])}
                        </div>
                    `
                    }
                </div>
                
                <div class="how-to-play">
                    <h4>How to Play</h4>
                    <ul>
                        <li>🎯 Spin the wheel once daily</li>
                        <li>🎁 Win exciting coin prizes</li>
                        <li>💰 Collect coins and redeem rewards</li>
                        <li>📅 Come back every day for more!</li>
                    </ul>
                </div>
                
                <div class="prize-table">
                    <h4>Prize Table</h4>
                    <div class="prizes-grid">
                        ${WHEEL_SEGMENTS.map(
                          (seg) => `
                            <div class="prize-item">
                                <div class="prize-color" style="background: ${seg.color}"></div>
                                <span>${seg.label}</span>
                            </div>
                        `,
                        ).join("")}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function checkCanSpin(state) {
  const lastSpin = state.spinWheel?.lastSpin;
  if (!lastSpin) return true;

  const lastSpinDate = new Date(lastSpin);
  const now = new Date();
  const hoursDiff = (now - lastSpinDate) / (1000 * 60 * 60);

  return hoursDiff >= DAILY_SPIN_RESET_HOURS;
}

function getCountdown(lastSpinTime) {
  if (!lastSpinTime) return "24:00:00";

  const lastSpin = new Date(lastSpinTime);
  const nextSpin = new Date(
    lastSpin.getTime() + DAILY_SPIN_RESET_HOURS * 60 * 60 * 1000,
  );
  const now = new Date();

  if (now >= nextSpin) return "Ready!";

  const diff = nextSpin - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function renderSpinHistory(history) {
  if (!history || history.length === 0) {
    return '<p class="no-history">No spins yet. Spin to win!</p>';
  }

  return history
    .slice(0, 5)
    .map(
      (win) => `
        <div class="history-item">
            <span>${win.label}</span>
            <span class="win-time">${formatTime(win.time)}</span>
        </div>
    `,
    )
    .join("");
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Draw the wheel on canvas
function drawWheel() {
  const canvas = document.getElementById("spinWheel");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10;
  const segmentAngle = (2 * Math.PI) / WHEEL_SEGMENTS.length;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw segments
  WHEEL_SEGMENTS.forEach((segment, i) => {
    const startAngle = i * segmentAngle - Math.PI / 2;
    const endAngle = startAngle + segmentAngle;

    // Draw segment
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = segment.color;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + segmentAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 3;
    ctx.fillText(segment.label, radius - 20, 5);
    ctx.restore();
  });

  // Draw outer circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Draw center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 3;
  ctx.stroke();
}

// Spin the wheel
export async function spinWheel() {
  const state = store.getState();

  if (!checkCanSpin(state)) {
    alert("You can only spin once per day!");
    return;
  }

  const spinBtn = document.getElementById("spinBtn");
  if (spinBtn) {
    spinBtn.disabled = true;
    spinBtn.textContent = "Spinning...";
  }

  // Determine winner based on probabilities
  const winner = selectWinner();

  // Animate the spin
  await animateSpin(winner);

  // Show result
  showResult(winner);

  // Update state
  const currentState = store.getState();
  const newHistory = [
    {
      label: winner.label,
      value: winner.value,
      time: new Date().toISOString(),
    },
  ];

  store.setState({
    spinWheel: {
      lastSpin: new Date().toISOString(),
      history: newHistory
        .concat(currentState.spinWheel?.history || [])
        .slice(0, 10),
    },
    user: {
      ...currentState.user,
      coins: (currentState.user?.coins || 0) + winner.value,
    },
  });

  // Save to backend
  try {
    await api.post("/rewards/spin", {
      prize_value: winner.value,
      prize_label: winner.label,
    });
  } catch (e) {
    console.log("Failed to save spin result:", e);
  }

  // Re-render after delay
  setTimeout(() => {
    renderPage();
  }, 2000);
}

function selectWinner() {
  const rand = Math.random();
  let cumulative = 0;

  for (const segment of WHEEL_SEGMENTS) {
    cumulative += segment.probability;
    if (rand <= cumulative) {
      return segment;
    }
  }

  return WHEEL_SEGMENTS[0];
}

async function animateSpin(winner) {
  const canvas = document.getElementById("spinWheel");
  if (!canvas) return;

  const segmentAngle = (2 * Math.PI) / WHEEL_SEGMENTS.length;
  const winnerIndex = WHEEL_SEGMENTS.findIndex((s) => s.label === winner.label);

  // Calculate target rotation (multiple full rotations + target segment)
  const targetAngle = -(winnerIndex * segmentAngle + segmentAngle / 2);
  const rotations = 5; // Number of full rotations
  const totalRotation = rotations * 2 * Math.PI + targetAngle;

  // Animate
  const duration = 5000; // 5 seconds
  const startTime = Date.now();
  const startRotation = 0;

  return new Promise((resolve) => {
    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-cubic)
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentRotation = startRotation + totalRotation * eased;

      drawWheelRotated(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }

    animate();
  });
}

function drawWheelRotated(rotation) {
  const canvas = document.getElementById("spinWheel");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10;
  const segmentAngle = (2 * Math.PI) / WHEEL_SEGMENTS.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);
  ctx.translate(-centerX, -centerY);

  WHEEL_SEGMENTS.forEach((segment, i) => {
    const startAngle = i * segmentAngle - Math.PI / 2;
    const endAngle = startAngle + segmentAngle;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = segment.color;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + segmentAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 3;
    ctx.fillText(segment.label, radius - 20, 5);
    ctx.restore();
  });

  ctx.restore();

  // Draw outer circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Draw center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function showResult(winner) {
  // Create celebration effect
  const container = document.querySelector(".wheel-wrapper");
  if (!container) return;

  const resultDiv = document.createElement("div");
  resultDiv.className = "spin-result";
  resultDiv.innerHTML = `
        <div class="result-content">
            <h2>🎉 Congratulations! 🎉</h2>
            <p class="prize-won">You won <strong>${winner.label}</strong>!</p>
            <div class="coins-earned">+${winner.value} 🪙</div>
        </div>
    `;

  container.appendChild(resultDiv);

  // Add animation
  setTimeout(() => {
    resultDiv.classList.add("show");
  }, 100);

  // Auto remove after 3 seconds
  setTimeout(() => {
    resultDiv.remove();
  }, 3000);
}

// Initialize
export function initSpinWheel() {
  // Draw initial wheel
  setTimeout(drawWheel, 100);

  // Start countdown timer
  startCountdownTimer();
}

function startCountdownTimer() {
  setInterval(() => {
    const countdownEl = document.getElementById("countdown");
    if (countdownEl) {
      const state = store.getState();
      countdownEl.textContent = getCountdown(state.spinWheel?.lastSpin);

      // Check if ready to spin
      if (checkCanSpin(state)) {
        renderPage();
      }
    }
  }, 1000);
}

function renderPage() {
  const container = document.getElementById("main");
  if (container) {
    container.innerHTML = renderSpinWheelPage();
    setTimeout(drawWheel, 100);
  }
}

// Make functions globally available
window.spinWheel = spinWheel;
window.initSpinWheel = initSpinWheel;

export default {
  render: () => {
    setTimeout(initSpinWheel, 100);
    return renderSpinWheelPage();
  },
};
