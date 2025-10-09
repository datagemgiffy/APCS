// script.js

let questions = [];
let currentQuestionIndex = -1;
let usedQuestions = [];

// Gemini API key (embedded for testing — not recommended in production)
const GEMINI_API_KEY = "AIzaSyBQmFX5Vlxwh_MPzIm1c3OmPcbnCay1za4";

// Load questions.json
async function loadQuestions() {
  try {
    const response = await fetch("questions.json");
    const data = await response.json();
    questions = data;
    showNextQuestion();
  } catch (err) {
    console.error("Error loading questions:", err);
  }
}

// Pick a random question, cycling through all before repeating
async function getRandomQuestion() {
  // If we've used all, reset
  if (usedQuestions.length === questions.length) {
    usedQuestions = [];
  }

  let question;
  let idx;

  // Keep picking until we find one not used
  do {
    idx = Math.floor(Math.random() * questions.length);
    question = questions[idx];
  } while (usedQuestions.includes(idx));

  usedQuestions.push(idx);

  // Occasionally generate an AI question
  if (Math.random() < 0.2) {
    const aiQ = await generateAIQuestion();
    if (aiQ) {
      return aiQ;
    }
  }

  return question;
}

// Call Gemini API to generate an AP CS-style question
async function generateAIQuestion() {
  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Generate a multiple-choice AP Computer Science style question with 4 answer options (A, B, C, D). Provide JSON with fields: question, options (array), correctAnswer, explanation."
            }]
          }]
        })
      }
    );

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    return parsed;
  } catch (err) {
    console.error("AI generation failed:", err);
    return null;
  }
}

// Render a question to UI
async function showNextQuestion() {
  const q = await getRandomQuestion();
  currentQuestionIndex++;

  const qText = document.getElementById("question-text");
  const answerArea = document.getElementById("answer-area");
  const inputArea = document.getElementById("input-area");
  const submitBtn = document.getElementById("submit-button");
  const nextBtn = document.getElementById("next-button");

  qText.textContent = q.question;
  answerArea.innerHTML = "";
  inputArea.classList.add("hidden");

  if (q.options) {
    // Multiple choice
    q.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.className =
        "mc-option w-full text-left p-3 border rounded-lg hover:bg-ap-blue hover:text-white";
      btn.onclick = () => checkAnswer(opt, q.correctAnswer, q.explanation);
      answerArea.appendChild(btn);
    });
  } else {
    // Free response
    inputArea.classList.remove("hidden");
    submitBtn.onclick = () => {
      const userAns = document.getElementById("user-input").value;
      checkAnswer(userAns, q.correctAnswer, q.explanation);
    };
  }

  // Reset buttons
  submitBtn.classList.remove("hidden");
  nextBtn.classList.add("hidden");
  document.getElementById("feedback-section").classList.add("hidden");
}

// Check answer and show feedback
function checkAnswer(userAnswer, correctAnswer, explanation) {
  const feedback = document.getElementById("feedback-section");
  const resultHeader = document.getElementById("result-header");
  const explanationContent = document.getElementById("explanation-content");
  const nextBtn = document.getElementById("next-button");
  const submitBtn = document.getElementById("submit-button");

  if (userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
    resultHeader.textContent = "✅ Correct!";
    resultHeader.className = "text-green-600 text-2xl font-bold mb-3";
  } else {
    resultHeader.textContent = `❌ Incorrect. Correct answer: ${correctAnswer}`;
    resultHeader.className = "text-red-600 text-2xl font-bold mb-3";
  }

  explanationContent.textContent = explanation;
  feedback.classList.remove("hidden");

  submitBtn.classList.add("hidden");
  nextBtn.classList.remove("hidden");
}

// Button wiring
document.getElementById("next-button").addEventListener("click", showNextQuestion);

// Init
loadQuestions();
