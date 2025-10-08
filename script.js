let currentQuestion = null;
let submitted = false;
let lastQuestionId = -1;
let currentLanguage = 'Java';

const API_KEY = "AIzaSyBQmFX5Vlxwh_MPzIm1c3OmPcbnCay1za4"; // Embedded Gemini API key

async function fetchAIQuestion(language) {
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Generate an AP Computer Science A style question in ${language}. Provide JSON with keys: id, language, type, prompt, code (if any), options (if mc), answer, explanation.` }] }]
      })
    });
    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
  } catch (e) {
    console.error("AI question fetch failed", e);
    return null;
  }
}

async function loadQuestions() {
  const res = await fetch("questions.json");
  const localQuestions = await res.json();

  // 20% chance to add an AI question
  if (Math.random() < 0.2) {
    const aiQ = await fetchAIQuestion(currentLanguage);
    if (aiQ) localQuestions.push(aiQ);
  }
  return localQuestions;
}

async function selectQuestion() {
  const allQuestions = await loadQuestions();
  const filtered = allQuestions.filter(q => q.language === currentLanguage);

  if (filtered.length === 0) {
    return { id: 0, type: 'input', prompt: `No questions for ${currentLanguage}`, code: null, answer: "", explanation: "", language: currentLanguage };
  }

  let q;
  do {
    q = filtered[Math.floor(Math.random() * filtered.length)];
  } while (q.id === lastQuestionId && filtered.length > 1);

  lastQuestionId = q.id;
  return q;
}

async function displayQuestion() {
  currentQuestion = await selectQuestion();
  submitted = false;

  const questionTextEl = document.getElementById('question-text');
  const answerAreaEl = document.getElementById('answer-area');
  const inputAreaEl = document.getElementById('input-area');
  const userInputEl = document.getElementById('user-input');
  const submitBtn = document.getElementById('submit-button');
  const nextBtn = document.getElementById('next-button');
  const feedbackSectionEl = document.getElementById('feedback-section');
  const resultHeaderEl = document.getElementById('result-header');
  const explanationContentEl = document.getElementById('explanation-content');

  answerAreaEl.innerHTML = '';
  inputAreaEl.classList.add('hidden');
  feedbackSectionEl.classList.add('hidden');
  submitBtn.classList.remove('hidden');
  nextBtn.classList.add('hidden');

  questionTextEl.innerHTML = `<span class='text-sm text-gray-500'>(${currentQuestion.language} Question)</span><br>${currentQuestion.prompt}`;
  if (currentQuestion.code) {
    const pre = document.createElement('pre');
    pre.className = 'code-block';
    pre.textContent = currentQuestion.code;
    questionTextEl.appendChild(pre);
  }

  if (currentQuestion.type === 'mc') {
    currentQuestion.options.forEach((opt, idx) => {
      const div = document.createElement('div');
      div.className = 'mc-option bg-ap-gray p-3 rounded-lg border border-gray-300';
      div.innerHTML = `<span class='font-medium text-ap-blue mr-2'>${String.fromCharCode(65+idx)}.</span> ${opt}`;
      div.dataset.value = opt;
      div.onclick = () => {
        if (submitted) return;
        [...answerAreaEl.children].forEach(d => d.classList.remove('selected'));
        div.classList.add('selected');
        userInputEl.dataset.selected = opt;
      };
      answerAreaEl.appendChild(div);
    });
  } else {
    inputAreaEl.classList.remove('hidden');
    userInputEl.value = '';
  }

  submitBtn.onclick = () => {
    if (submitted) return;
    let userAnswer = '';
    if (currentQuestion.type === 'mc') userAnswer = userInputEl.dataset.selected || '';
    else userAnswer = userInputEl.value;

    submitted = true;
    submitBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');

    const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
    feedbackSectionEl.classList.remove('hidden');
    resultHeaderEl.textContent = isCorrect ? "Correct! ✅" : "Incorrect ❌";
    explanationContentEl.innerHTML = `<p><strong>Your Answer:</strong> ${userAnswer}</p><p><strong>Correct:</strong> ${currentQuestion.answer}</p><p>${currentQuestion.explanation}</p>`;
  };

  nextBtn.onclick = () => displayQuestion();
}

window.onload = () => {
  const langSelect = document.getElementById('language-select');
  langSelect.onchange = e => { currentLanguage = e.target.value; displayQuestion(); };
  displayQuestion();
};
