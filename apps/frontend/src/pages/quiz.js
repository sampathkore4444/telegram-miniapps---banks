/**
 * Financial Quiz Page
 * Gamified financial health assessment
 */

const QuizPage = {
  currentQuestion: 0,
  score: 0,
  questions: [],

  /**
   * Render quiz page
   * @param {object} params - Page parameters
   * @param {function} callback - Callback to render HTML
   */
  render(params, callback) {
    this.questions = this.getQuestions();
    const html = `
            ${this.renderProgress()}
            ${this.renderQuestion()}
        `;

    callback(html);
    this.bindEvents();
  },

  /**
   * Render progress bar
   * @returns {string}
   */
  renderProgress() {
    const total = this.questions.length;
    const current = this.currentQuestion + 1;
    const progress = (current / total) * 100;

    return `
            <div class="quiz-progress">
                <div class="quiz-progress-info">
                    <span>Question ${current} of ${total}</span>
                    <span class="score">Score: ${this.score}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
  },

  /**
   * Render current question
   * @returns {string}
   */
  renderQuestion() {
    const question = this.questions[this.currentQuestion];

    return `
            <div class="card quiz-card">
                <div class="question-category">
                    <span class="badge badge-info">${question.category}</span>
                </div>
                <h3 class="question-text">${question.question}</h3>
                <div class="options-list">
                    ${question.options
                      .map(
                        (option, index) => `
                        <div class="option-item" data-index="${index}">
                            <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                            <div class="option-text">${option.text}</div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `;
  },

  /**
   * Render results
   * @returns {string}
   */
  renderResults() {
    const totalQuestions = this.questions.length;
    const percentage = (this.score / totalQuestions) * 100;
    const level = this.getFinancialLevel(percentage);

    return `
            <div class="card text-center">
                <div class="quiz-result-icon" style="background-color: ${level.color}20; color: ${level.color}">
                    ${level.icon}
                </div>
                <h2 class="mt-lg">${level.title}</h2>
                <p class="text-muted">Your financial health score</p>
                <div class="result-score">${this.score}/${totalQuestions}</div>
                <div class="result-percentage">${Math.round(percentage)}%</div>
                <div class="result-description mt-lg">
                    <p>${level.description}</p>
                </div>
                ${this.renderRecommendations(level.level)}
                <div class="quiz-actions mt-xl">
                    <button class="btn btn-primary btn-block" id="retakeQuizBtn">
                        Retake Quiz
                    </button>
                    <button class="btn btn-outline btn-block mt-md" id="shareResultBtn">
                        Share Result
                    </button>
                    <button class="btn btn-ghost btn-block mt-md" id="backHomeBtn">
                        Back to Home
                    </button>
                </div>
            </div>
        `;
  },

  /**
   * Render recommendations
   * @param {number} level - Financial level
   * @returns {string}
   */
  renderRecommendations(level) {
    const recommendations = {
      beginner: [
        "Start with a basic savings account",
        "Learn about budgeting basics",
        "Set up automatic savings",
      ],
      intermediate: [
        "Consider diversifying investments",
        "Review your spending patterns",
        "Look into low-risk investment options",
      ],
      advanced: [
        "Explore wealth management",
        "Consider tax optimization strategies",
        "Review your portfolio regularly",
      ],
    };

    const recs =
      level <= 1
        ? recommendations.beginner
        : level === 2
          ? recommendations.intermediate
          : recommendations.advanced;

    return `
            <div class="recommendations mt-lg">
                <h4>Recommendations for You</h4>
                <ul class="recommendation-list">
                    ${recs
                      .map(
                        (r) => `
                        <li>${r}</li>
                    `,
                      )
                      .join("")}
                </ul>
            </div>
        `;
  },

  /**
   * Get financial level based on score
   * @param {number} percentage - Score percentage
   * @returns {object}
   */
  getFinancialLevel(percentage) {
    if (percentage >= 80) {
      return {
        level: 3,
        title: "Excellent!",
        color: "#27AE60",
        icon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
        description:
          "You have excellent financial knowledge! You're well on your way to financial success.",
      };
    } else if (percentage >= 50) {
      return {
        level: 2,
        title: "Good Progress!",
        color: "#F39C12",
        icon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        description:
          "You have a good understanding of financial basics. Keep learning and growing!",
      };
    } else {
      return {
        level: 1,
        title: "Getting Started",
        color: "#3498DB",
        icon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        description:
          "There's room to grow! Start learning about personal finance basics.",
      };
    }
  },

  /**
   * Get quiz questions
   * @returns {array}
   */
  getQuestions() {
    return [
      {
        category: "Budgeting",
        question: "How often should you review your budget?",
        options: [
          { text: "Once a year", points: 0 },
          { text: "Monthly", points: 2 },
          { text: "Never", points: 0 },
          { text: "Only when in trouble", points: 1 },
        ],
      },
      {
        category: "Savings",
        question: "How much of your income should you save?",
        options: [
          { text: "Whatever is left", points: 0 },
          { text: "At least 20%", points: 2 },
          { text: "Nothing", points: 0 },
          { text: "Only 5%", points: 1 },
        ],
      },
      {
        category: "Debt",
        question: "What should be your priority when paying off debt?",
        options: [
          { text: "Pay minimum on all", points: 0 },
          { text: "High-interest debt first", points: 2 },
          { text: "Largest balance first", points: 1 },
          { text: "Ignore it", points: 0 },
        ],
      },
      {
        category: "Investment",
        question: "What is diversification in investing?",
        options: [
          { text: "Putting all money in one stock", points: 0 },
          { text: "Spreading investments across different assets", points: 2 },
          { text: "Only investing in gold", points: 0 },
          { text: "Keeping all money in savings", points: 1 },
        ],
      },
      {
        category: "Emergency Fund",
        question: "How much should your emergency fund cover?",
        options: [
          { text: "1 week of expenses", points: 0 },
          { text: "3-6 months of expenses", points: 2 },
          { text: "1 month of expenses", points: 1 },
          { text: "No emergency fund needed", points: 0 },
        ],
      },
    ];
  },

  /**
   * Bind page events
   */
  bindEvents() {
    // Option selection
    document.querySelectorAll(".option-item").forEach((option) => {
      option.addEventListener("click", () => {
        const index = parseInt(option.dataset.index);
        this.selectAnswer(index);
      });
    });

    // Result buttons
    const retakeBtn = document.getElementById("retakeQuizBtn");
    if (retakeBtn) {
      retakeBtn.addEventListener("click", () => {
        this.retake();
      });
    }

    const shareBtn = document.getElementById("shareResultBtn");
    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        this.shareResult();
      });
    }

    const homeBtn = document.getElementById("backHomeBtn");
    if (homeBtn) {
      homeBtn.addEventListener("click", () => {
        store.setCurrentPage("home");
      });
    }
  },

  /**
   * Select answer
   * @param {number} index - Option index
   */
  selectAnswer(index) {
    const question = this.questions[this.currentQuestion];
    const selectedOption = question.options[index];
    this.score += selectedOption.points;

    // Visual feedback
    document.querySelectorAll(".option-item").forEach((opt, i) => {
      opt.classList.remove("selected");
      if (i === index) {
        opt.classList.add("selected");
      }
      opt.classList.add("disabled");
    });

    // Next question after delay
    setTimeout(() => {
      this.nextQuestion();
    }, 1000);
  },

  /**
   * Go to next question
   */
  nextQuestion() {
    this.currentQuestion++;

    if (this.currentQuestion >= this.questions.length) {
      // Show results
      const main = document.getElementById("main");
      main.innerHTML = this.renderResults();
      this.bindEvents();
    } else {
      // Show next question
      const main = document.getElementById("main");
      main.innerHTML = `
                ${this.renderProgress()}
                ${this.renderQuestion()}
            `;
      this.bindEvents();
    }
  },

  /**
   * Retake quiz
   */
  retake() {
    this.currentQuestion = 0;
    this.score = 0;
    this.render({}, (html) => {
      const main = document.getElementById("main");
      main.innerHTML = html;
      this.bindEvents();
    });
  },

  /**
   * Share result
   */
  shareResult() {
    const text = `I scored ${this.score}/${this.questions.length} on the Financial Health Quiz! Take the quiz and check your financial knowledge.`;

    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.shareUrl(text);
    } else if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        window.showToast("Result copied to clipboard!", "success");
      });
    }
  },
};

// Export
window.QuizPage = QuizPage;
