/**
 * Social Features Page - Achievements, Leaderboards, Share
 */

import { navigateTo } from "../utils/router.js";
import { api } from "../utils/api.js";
import { store } from "../store/app.js";

// Achievement tier definitions
const TIER_COLORS = {
  bronze: { bg: "#CD7F32", text: "#FFF8F0", glow: "rgba(205, 127, 50, 0.4)" },
  silver: { bg: "#C0C0C0", text: "#1A1A1A", glow: "rgba(192, 192, 192, 0.4)" },
  gold: { bg: "#FFD700", text: "#1A1A1A", glow: "rgba(255, 215, 0, 0.4)" },
};

// Achievement definitions with tiers
const ACHIEVEMENTS = [
  // Bronze tier (easy achievements)
  {
    id: "first_login",
    name: "Welcome",
    icon: "👋",
    description: "First login to the app",
    coins: 10,
    tier: "bronze",
    threshold: 1,
  },
  {
    id: "first_loan",
    name: "First Loan",
    icon: "💰",
    description: "Apply for first loan",
    coins: 50,
    tier: "bronze",
    threshold: 1,
  },
  {
    id: "early_payment",
    name: "Punctual",
    icon: "⏰",
    description: "Early loan payment",
    coins: 30,
    tier: "bronze",
    threshold: 1,
  },
  // Silver tier (medium achievements)
  {
    id: "streak_3",
    name: "Rising Star",
    icon: "⭐",
    description: "3-day check-in streak",
    coins: 25,
    tier: "silver",
    threshold: 3,
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    icon: "🏃",
    description: "7-day check-in streak",
    coins: 75,
    tier: "silver",
    threshold: 7,
  },
  {
    id: "referral_3",
    name: "Friend Maker",
    icon: "🤝",
    description: "Refer 3 friends",
    coins: 100,
    tier: "silver",
    threshold: 3,
  },
  {
    id: "quiz_master",
    name: "Quiz Master",
    icon: "🧠",
    description: "Complete 5 quizzes",
    coins: 100,
    tier: "silver",
    threshold: 5,
  },
  {
    id: "spin_10",
    name: "Lucky Spinner",
    icon: "🎰",
    description: "Spin 10 times",
    coins: 75,
    tier: "silver",
    threshold: 10,
  },
  // Gold tier (hard achievements)
  {
    id: "streak_14",
    name: "Fortnight Fighter",
    icon: "⚔️",
    description: "14-day check-in streak",
    coins: 150,
    tier: "gold",
    threshold: 14,
  },
  {
    id: "streak_30",
    name: "Monthly Champion",
    icon: "👑",
    description: "30-day check-in streak",
    coins: 300,
    tier: "gold",
    threshold: 30,
  },
  {
    id: "referral_10",
    name: "Influencer",
    icon: "🌟",
    description: "Refer 10 friends",
    coins: 500,
    tier: "gold",
    threshold: 10,
  },
  {
    id: "referral_25",
    name: "Network Legend",
    icon: "🏅",
    description: "Refer 25 friends",
    coins: 1000,
    tier: "gold",
    threshold: 25,
  },
];

// Get tier badge display
function getTierBadge(tier) {
  const badges = {
    bronze: "🥉",
    silver: "🥈",
    gold: "🥇",
  };
  return badges[tier] || "";
}

// Get tier color style
function getTierStyle(tier, isEarned) {
  if (!isEarned) {
    return "filter: grayscale(100%); opacity: 0.6;";
  }
  const colors = TIER_COLORS[tier];
  if (!colors) return "";
  return `background: linear-gradient(135deg, ${colors.bg}22, ${colors.bg}44); border: 2px solid ${colors.bg}; box-shadow: 0 0 12px ${colors.glow};`;
}

export function renderSocialPage() {
  const state = store.getState();
  const user = state.user;

  return `
        <div class="page social-page">
            <div class="page-header">
                <button class="back-btn" onclick="window.navigateTo('home')">
                    ← Back
                </button>
                <h1>Social</h1>
            </div>
            
            <div class="social-container">
                <div class="social-tabs">
                    <button class="tab-btn active" onclick="window.showTab('achievements')">🏆 Achievements</button>
                    <button class="tab-btn" onclick="window.showTab('leaderboard')">📊 Leaderboard</button>
                    <button class="tab-btn" onclick="window.showTab('share')">📤 Share</button>
                </div>
                
                <div id="achievements-tab" class="tab-content active">
                    ${renderAchievements()}
                </div>
                
                <div id="leaderboard-tab" class="tab-content">
                    ${renderLeaderboard()}
                </div>
                
                <div id="share-tab" class="tab-content">
                    ${renderShareSection()}
                </div>
            </div>
        </div>
    `;
}

function renderAchievements() {
  const state = store.getState();
  const earned = state.achievements || [];

  // Count achievements by tier
  const bronzeCount = ACHIEVEMENTS.filter((a) => a.tier === "bronze").length;
  const silverCount = ACHIEVEMENTS.filter((a) => a.tier === "silver").length;
  const goldCount = ACHIEVEMENTS.filter((a) => a.tier === "gold").length;

  const earnedBronze = ACHIEVEMENTS.filter(
    (a) => a.tier === "bronze" && earned.includes(a.id),
  ).length;
  const earnedSilver = ACHIEVEMENTS.filter(
    (a) => a.tier === "silver" && earned.includes(a.id),
  ).length;
  const earnedGold = ACHIEVEMENTS.filter(
    (a) => a.tier === "gold" && earned.includes(a.id),
  ).length;

  return `
        <div class="achievements-section">
            <div class="tier-stats">
                <div class="tier-stat bronze">
                    <span class="tier-stat-value">${earnedBronze}/${bronzeCount}</span>
                    <span class="tier-stat-label">🥉 Bronze</span>
                </div>
                <div class="tier-stat silver">
                    <span class="tier-stat-value">${earnedSilver}/${silverCount}</span>
                    <span class="tier-stat-label">🥈 Silver</span>
                </div>
                <div class="tier-stat gold">
                    <span class="tier-stat-value">${earnedGold}/${goldCount}</span>
                    <span class="tier-stat-label">🥇 Gold</span>
                </div>
            </div>
            
            <div class="achievement-tiers">
                <button class="tier-filter-btn active" onclick="window.filterAchievements('all')">
                    All (${earned.length}/${ACHIEVEMENTS.length})
                </button>
                <button class="tier-filter-btn bronze" onclick="window.filterAchievements('bronze')">
                    🥉 Bronze
                </button>
                <button class="tier-filter-btn silver" onclick="window.filterAchievements('silver')">
                    🥈 Silver
                </button>
                <button class="tier-filter-btn gold" onclick="window.filterAchievements('gold')">
                    🥇 Gold
                </button>
            </div>
            
            <div class="achievements-grid">
                ${ACHIEVEMENTS.map((a) => {
                  const isEarned = earned.includes(a.id);
                  const tierBadge = getTierBadge(a.tier);
                  return `
                        <div class="achievement-card ${isEarned ? "earned" : "locked"} ${a.tier}" data-tier="${a.tier}">
                            <div class="achievement-icon">${a.icon}</div>
                            <div class="achievement-info">
                                <h4>${tierBadge} ${a.name}</h4>
                                <p>${a.description}</p>
                                <span class="achievement-reward">+${a.coins} 🪙</span>
                            </div>
                            ${isEarned ? '<span class="check-badge">✓</span>' : '<span class="lock-badge">🔒</span>'}
                        </div>
                    `;
                }).join("")}
            </div>
        </div>
    `;
}

// Global function to filter achievements
window.filterAchievements = function (tier) {
  // Update active button
  document.querySelectorAll(".tier-filter-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (
      (tier === "all" && btn.textContent.includes("All")) ||
      btn.classList.contains(tier)
    ) {
      btn.classList.add("active");
    }
  });

  // Filter cards
  document.querySelectorAll(".achievement-card").forEach((card) => {
    if (tier === "all") {
      card.style.display = "flex";
    } else {
      card.style.display = card.dataset.tier === tier ? "flex" : "none";
    }
  });
};

function renderLeaderboard() {
  return `
        <div class="leaderboard-section">
            <div class="leaderboard-tabs">
                <button class="tab-btn active" onclick="window.showLeaderboardTab('referrals')">👥 Referrals</button>
                <button class="tab-btn" onclick="window.showLeaderboardTab('streaks')">🔥 Streaks</button>
                <button class="tab-btn" onclick="window.showLeaderboardTab('earnings')">💰 Earnings</button>
            </div>
            
            <div id="referrals-leaderboard" class="leaderboard-content">
                ${renderLeaderboardList("referrals")}
            </div>
            
            <div id="streaks-leaderboard" class="leaderboard-content" style="display:none">
                ${renderLeaderboardList("streaks")}
            </div>
            
            <div id="earnings-leaderboard" class="leaderboard-content" style="display:none">
                ${renderLeaderboardList("earnings")}
            </div>
        </div>
    `;
}

function renderLeaderboardList(type) {
  // Mock leaderboard data
  const mockData = {
    referrals: [
      { rank: 1, name: "John D.", value: 25, icon: "👑" },
      { rank: 2, name: "Sarah M.", value: 18, icon: "🥈" },
      { rank: 3, name: "Mike R.", value: 15, icon: "🥉" },
      { rank: 4, name: "Emily K.", value: 12, icon: "💎" },
      { rank: 5, name: "You", value: 8, icon: "👤", isCurrentUser: true },
    ],
    streaks: [
      { rank: 1, name: "Alex T.", value: 45, icon: "🔥" },
      { rank: 2, name: "Lisa P.", value: 38, icon: "🔥" },
      { rank: 3, name: "David L.", value: 30, icon: "🔥" },
      { rank: 4, name: "You", value: 7, icon: "🔥", isCurrentUser: true },
      { rank: 5, name: "Tom H.", value: 5, icon: "🔥" },
    ],
    earnings: [
      { rank: 1, name: "Emma W.", value: 1250, icon: "💰" },
      { rank: 2, name: "Chris B.", value: 980, icon: "💵" },
      { rank: 3, name: "Anna S.", value: 850, icon: "💴" },
      { rank: 4, name: "You", value: 145, icon: "👤", isCurrentUser: true },
      { rank: 5, name: "Kevin J.", value: 120, icon: "💶" },
    ],
  };

  const data = mockData[type] || [];
  const valueLabel = type === "earnings" ? "$" : "";

  return `
        <div class="leaderboard-list">
            ${data
              .map(
                (item) => `
                <div class="leaderboard-item ${item.isCurrentUser ? "current-user" : ""}">
                    <span class="rank">${item.rank <= 3 ? item.icon : item.rank}</span>
                    <span class="name">${item.name}</span>
                    <span class="value">${valueLabel}${item.value}</span>
                </div>
            `,
              )
              .join("")}
        </div>
    `;
}

function renderShareSection() {
  const state = store.getState();
  const user = state.user || {};
  const streak = state.streak?.currentStreak || 0;
  const coins = user.coins || 0;

  return `
        <div class="share-section">
            <div class="share-card">
                <h3>Share Your Progress</h3>
                <div class="share-preview">
                    <div class="share-icon">🏆</div>
                    <p>I'm on a ${streak}-day streak with $${coins} coins!</p>
                    <small>Join me on Bank Mini App</small>
                </div>
                
                <div class="share-buttons">
                    <button class="btn btn-primary" onclick="window.shareToTelegram()">
                        📱 Share to Telegram
                    </button>
                    <button class="btn btn-secondary" onclick="window.copyShareLink()">
                        📋 Copy Link
                    </button>
                </div>
            </div>
            
            <div class="share-card">
                <h3>Invite Friends</h3>
                <p>Earn ${getReferralReward()} coins for each friend who signs up!</p>
                
                <div class="referral-link">
                    <input type="text" readonly value="${generateReferralLink()}" id="referralLink">
                    <button class="btn btn-sm" onclick="window.copyReferralLink()">Copy</button>
                </div>
            </div>
            
            <div class="share-card">
                <h3>Share Achievement</h3>
                <p>Show off your achievements to friends!</p>
                
                <button class="btn btn-outline btn-block" onclick="window.shareAchievements()">
                    🎉 Share Achievements
                </button>
            </div>
        </div>
    `;
}

function getReferralReward() {
  return 10; // Default referral reward
}

function generateReferralLink() {
  const state = store.getState();
  const userId = state.user?.id || "guest";
  return `https://t.me/BankMiniAppBot/app?start=ref_${userId}`;
}

// Global functions
window.showTab = function (tabId) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
    content.style.display = "none";
  });

  document
    .querySelector(`[onclick="window.showTab('${tabId}')"]`)
    .classList.add("active");
  document.getElementById(`${tabId}-tab`).style.display = "block";
  document.getElementById(`${tabId}-tab`).classList.add("active");
};

window.showLeaderboardTab = function (type) {
  document.querySelectorAll(".leaderboard-tabs .tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelectorAll(".leaderboard-content").forEach((content) => {
    content.style.display = "none";
  });

  document
    .querySelector(`[onclick="window.showLeaderboardTab('${type}')"]`)
    .classList.add("active");
  document.getElementById(`${type}-leaderboard`).style.display = "block";
};

window.shareToTelegram = function () {
  const state = store.getState();
  const user = state.user || {};
  const streak = state.streak?.currentStreak || 0;
  const coins = user.coins || 0;

  const text = encodeURIComponent(
    `🏆 Check out my progress!\n\n🔥 ${streak}-day streak\n💰 $${coins} coins\n\nJoin me on Bank Mini App!`,
  );

  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.openTelegramLink(
      `https://t.me/share/url?url=${generateReferralLink()}&text=${text}`,
    );
  } else {
    alert("Share: " + text);
  }
};

window.copyShareLink = function () {
  const link = generateReferralLink();
  navigator.clipboard
    .writeText(link)
    .then(() => {
      alert("Link copied to clipboard!");
    })
    .catch(() => {
      alert("Failed to copy. Please copy manually: " + link);
    });
};

window.copyReferralLink = function () {
  const link =
    document.getElementById("referralLink")?.value || generateReferralLink();
  navigator.clipboard
    .writeText(link)
    .then(() => {
      alert("Referral link copied!");
    })
    .catch(() => {
      alert("Failed to copy");
    });
};

window.shareAchievements = function () {
  const state = store.getState();
  const earned = state.achievements || [];
  const achievementNames = earned
    .map((id) => {
      const a = ACHIEVEMENTS.find((x) => x.id === id);
      return a ? a.name : "";
    })
    .filter(Boolean);

  const text = encodeURIComponent(
    `🎉 My Achievements:\n\n${achievementNames.join("\n") || "Just getting started!"}\n\n👇 Join me!`,
  );

  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.openTelegramLink(
      `https://t.me/share/url?url=${generateReferralLink()}&text=${text}`,
    );
  } else {
    alert("Share: " + text);
  }
};

export default { render: renderSocialPage };
