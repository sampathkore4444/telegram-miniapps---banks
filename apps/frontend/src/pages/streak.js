/**
 * Daily Check-in Streak Page
 * Users earn bonus rewards for consecutive daily check-ins
 */

import { navigateTo } from "../utils/router.js";
import { api } from "../utils/api.js";
import { store } from "../store/app.js";

// Streak configuration
const STREAK_REWARDS = {
  1: { coins: 5, label: "Day 1" },
  3: { coins: 15, label: "Day 3 Bonus" },
  7: { coins: 50, label: "Week Streak!" },
  14: { coins: 100, label: "2 Week Streak!" },
  30: { coins: 300, label: "Month Streak!!" },
  60: { coins: 500, label: "2 Month Streak!!!" },
  90: { coins: 1000, label: "Mega Streak!!!" },
};

const MAX_STREAK = 90;

export function renderStreakPage() {
  const state = store.getState();
  const streak = state.streak || {
    currentStreak: 0,
    lastCheckIn: null,
    totalCheckIns: 0,
  };

  const canCheckIn = checkCanCheckIn(streak);
  const streakData = calculateStreakData(streak);

  return `
        <div class="page streak-page">
            <div class="page-header">
                <button class="back-btn" onclick="window.navigateTo('home')">
                    ← Back
                </button>
                <h1>Daily Check-in</h1>
            </div>
            
            <div class="streak-container">
                <div class="streak-header">
                    <div class="current-streak">
                        <div class="flame-icon">🔥</div>
                        <div class="streak-number">${streak.currentStreak}</div>
                        <div class="streak-label">Day Streak</div>
                    </div>
                </div>
                
                ${
                  canCheckIn
                    ? `
                    <div class="check-in-action">
                        <p class="check-in-text">Check in daily to grow your streak!</p>
                        <button class="btn btn-primary btn-large" onclick="window.doCheckIn()">
                            ✓ CHECK IN NOW
                        </button>
                    </div>
                `
                    : `
                    <div class="next-checkin">
                        <p>✓ You've checked in today!</p>
                        <p class="next-time">Come back tomorrow to continue your streak</p>
                    </div>
                `
                }
                
                <div class="progress-section">
                    <h3>Streak Progress</h3>
                    <div class="streak-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${streakData.progressPercent}%"></div>
                        </div>
                        <div class="progress-labels">
                            <span>Day ${streak.currentStreak}</span>
                            <span>Day ${streakData.nextMilestone}</span>
                        </div>
                    </div>
                </div>
                
                <div class="milestones">
                    <h3>Milestone Rewards</h3>
                    <div class="milestone-list">
                        ${renderMilestones(streak.currentStreak)}
                    </div>
                </div>
                
                <div class="stats">
                    <div class="stat-card">
                        <span class="stat-value">${streak.totalCheckIns}</span>
                        <span class="stat-label">Total Check-ins</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${streakData.longestStreak}</span>
                        <span class="stat-label">Longest Streak</span>
                    </div>
                </div>
                
                <div class="tips">
                    <h4>💡 Tips</h4>
                    <ul>
                        <li>Check in every day to grow your streak</li>
                        <li>Missing a day resets your streak to 0</li>
                        <li>Milestone rewards are one-time bonuses</li>
                        <li>Higher streaks unlock bigger rewards!</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function checkCanCheckIn(streak) {
  if (!streak.lastCheckIn) return true;

  const lastCheckIn = new Date(streak.lastCheckIn);
  const now = new Date();
  const lastCheckInDay = lastCheckIn.toDateString();
  const today = now.toDateString();

  return lastCheckInDay !== today;
}

function calculateStreakData(streak) {
  const milestones = [1, 3, 7, 14, 30, 60, 90];
  const current = streak.currentStreak || 0;

  // Find next milestone
  let nextMilestone = milestones[0];
  for (const m of milestones) {
    if (m > current) {
      nextMilestone = m;
      break;
    }
  }

  // Find progress to next milestone
  let prevMilestone = 0;
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (milestones[i] <= current) {
      prevMilestone = milestones[i];
      break;
    }
  }

  // Handle case where at or past max streak
  if (!nextMilestone) nextMilestone = MAX_STREAK;

  const progressPercent =
    ((current - prevMilestone) / (nextMilestone - prevMilestone)) * 100 || 0;

  return {
    nextMilestone,
    progressPercent: Math.min(progressPercent, 100),
    longestStreak: streak.longestStreak || current,
  };
}

function renderMilestones(currentStreak) {
  const milestones = [
    { day: 1, coins: 5, icon: "🌱" },
    { day: 3, coins: 15, icon: "🌿" },
    { day: 7, coins: 50, icon: "🌳" },
    { day: 14, coins: 100, icon: "🏆" },
    { day: 30, coins: 300, icon: "👑" },
    { day: 60, coins: 500, icon: "💎" },
    { day: 90, coins: 1000, icon: "🌟" },
  ];

  return milestones
    .map((m) => {
      const isAchieved = currentStreak >= m.day;
      const isNext = currentStreak + 1 >= m.day && currentStreak < m.day;

      return `
            <div class="milestone-item ${isAchieved ? "achieved" : ""} ${isNext ? "next" : ""}">
                <div class="milestone-icon">${m.icon}</div>
                <div class="milestone-info">
                    <span class="milestone-day">Day ${m.day}</span>
                    <span class="milestone-reward">+${m.coins} Coins</span>
                </div>
                ${isAchieved ? '<span class="check">✓</span>' : ""}
            </div>
        `;
    })
    .join("");
}

// Check in action
export async function doCheckIn() {
  try {
    const response = await api.post("/streak/checkin", {});

    if (response.success) {
      const state = store.getState();
      const currentStreak = (state.streak?.currentStreak || 0) + 1;
      const longestStreak = Math.max(
        currentStreak,
        state.streak?.longestStreak || 0,
      );

      // Check for milestone bonus
      let bonusMessage = "";
      if (STREAK_REWARDS[currentStreak]) {
        bonusMessage = `\n🎉 Milestone reached: ${STREAK_REWARDS[currentStreak].label} (+${STREAK_REWARDS[currentStreak].coins} bonus coins!)`;
      }

      store.setState({
        streak: {
          currentStreak,
          longestStreak,
          lastCheckIn: new Date().toISOString(),
          totalCheckIns: (state.streak?.totalCheckIns || 0) + 1,
        },
      });

      alert(
        `✓ Check-in successful!\n🔥 Day ${currentStreak} streak!${bonusMessage}`,
      );

      // Re-render page
      renderPage();
    }
  } catch (error) {
    console.error("Check-in error:", error);
    alert("Failed to check in. Please try again.");
  }
}

function renderPage() {
  const container = document.getElementById("main");
  if (container) {
    container.innerHTML = renderStreakPage();
  }
}

// Make function globally available
window.doCheckIn = doCheckIn;

export default {
  render: renderStreakPage,
};
