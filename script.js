// Utility function to update navigation state based on login
function updateNav() {
  try {
    const user = JSON.parse(localStorage.getItem('twinsfluent_user'));
    const navDashboard = document.getElementById('nav-dashboard');
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navLogout = document.getElementById('nav-logout');
    if (navDashboard && navLogin && navRegister && navLogout) {
      if (user) {
        navDashboard.classList.remove('d-none');
        navLogin.classList.add('d-none');
        navRegister.classList.add('d-none');
        navLogout.classList.remove('d-none');
      } else {
        navDashboard.classList.add('d-none');
        navLogin.classList.remove('d-none');
        navRegister.classList.remove('d-none');
        navLogout.classList.add('d-none');
      }
    }
  } catch (e) {
    console.error(e);
  }
}

// Logout function
function logout() {
  localStorage.removeItem('twinsfluent_user');
  location.href = 'index.html';
}

// Registration handler
function registerUser(event) {
  event.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  const message = document.getElementById('reg-message');
  if (!name || !email || !password) {
    message.textContent = 'Please fill in all fields.';
    message.className = 'text-danger';
    return;
  }
  if (password !== confirm) {
    message.textContent = 'Passwords do not match.';
    message.className = 'text-danger';
    return;
  }
  const user = { name, email, password };
  localStorage.setItem('twinsfluent_user', JSON.stringify(user));
  message.textContent = 'Registration successful! Redirecting...';
  message.className = 'text-success';
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1000);
}

// Login handler
function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const message = document.getElementById('login-message');
  const stored = localStorage.getItem('twinsfluent_user');
  if (!stored) {
    message.textContent = 'No account found. Please register.';
    message.className = 'text-danger';
    return;
  }
  const user = JSON.parse(stored);
  if (user.email === email && user.password === password) {
    message.textContent = 'Login successful! Redirecting...';
    message.className = 'text-success';
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 500);
  } else {
    message.textContent = 'Incorrect email or password.';
    message.className = 'text-danger';
  }
}

// Placement test evaluation
function evaluateTest(event) {
  event.preventDefault();
  let score = 0;
  const answers = {
    q1: 'b',
    q2: 'b',
    q3: 'b',
    q4: 'b',
    q5: 'c',
    q6: 'c',
    q7: 'c',
    q8: 'a',
    q9: 'c',
    q10:'c'
  };
  for (const key in answers) {
    const radios = document.getElementsByName(key);
    let selected = '';
    radios.forEach(radio => {
      if (radio.checked) selected = radio.value;
    });
    if (selected === answers[key]) {
      score++;
    }
  }
  // Store score in localStorage
  localStorage.setItem('twinsfluent_score', String(score));
  // Redirect to plan page
  window.location.href = 'plan.html';
}

/*
 * Extended 30‑minute placement test evaluation
 * This version measures four skills: reading, listening, writing and speaking.
 * It expects radio groups r1–r3 and l1–l3, textareas w1–w3 and hidden inputs s1–s3.
 * Each correctly answered reading/listening question earns 1 point. Writing and speaking
 * responses earn a point when the answer contains at least 30 words, half a point for
 * 10–29 words and zero otherwise.
 */
function evaluateFullTest(event) {
  if (event) event.preventDefault();
  let score = 0;
  // Reading answers
  const readingAnswers = { r1: 'b', r2: 'd', r3: 'd' };
  for (const key in readingAnswers) {
    const radios = document.getElementsByName(key);
    let selected = '';
    radios.forEach(radio => {
      if (radio.checked) selected = radio.value;
    });
    if (selected === readingAnswers[key]) score++;
  }
  // Listening answers
  const listeningAnswers = { l1: 'c', l2: 'b', l3: 'b' };
  for (const key in listeningAnswers) {
    const radios = document.getElementsByName(key);
    let selected = '';
    radios.forEach(radio => {
      if (radio.checked) selected = radio.value;
    });
    if (selected === listeningAnswers[key]) score++;
  }
  // Writing evaluations
  ['w1','w2','w3'].forEach(id => {
    const textarea = document.getElementById(id);
    if (!textarea) return;
    const words = textarea.value.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 30) {
      score += 1;
    } else if (words.length >= 10) {
      score += 0.5;
    }
  });
  // Speaking evaluations
  ['s1','s2','s3'].forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    const words = input.value.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 30) {
      score += 1;
    } else if (words.length >= 10) {
      score += 0.5;
    }
  });
  // Round down to integer for mapping
  const intScore = Math.round(score);
  localStorage.setItem('twinsfluent_score', String(intScore));
  window.location.href = 'plan.html';
}

// Timer for full placement test (30 minutes)
let testRemainingSeconds = 0;
let testTimerInterval = null;
function startTestTimer(durationMinutes = 30) {
  const timerEl = document.getElementById('test-timer');
  if (!timerEl) return;
  testRemainingSeconds = durationMinutes * 60;
  timerEl.textContent = formatTime(testRemainingSeconds);
  testTimerInterval = setInterval(() => {
    testRemainingSeconds--;
    if (testRemainingSeconds <= 0) {
      clearInterval(testTimerInterval);
      timerEl.textContent = '00:00';
      // Auto submit test
      evaluateFullTest();
    } else {
      timerEl.textContent = formatTime(testRemainingSeconds);
    }
  }, 1000);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Speech synthesis to play listening questions
function playListeningPrompt(text) {
  if (!('speechSynthesis' in window)) {
    alert('Your browser does not support speech synthesis.');
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
}

// Speech recognition for speaking tasks
let recognition = null;
function startRecording(questionId) {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert('Your browser does not support speech recognition.');
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    // display transcript
    const displayEl = document.getElementById(`${questionId}-display`);
    if (displayEl) displayEl.textContent = transcript;
    // store in hidden input
    const hiddenInput = document.getElementById(questionId);
    if (hiddenInput) hiddenInput.value = transcript;
  };
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  };
  recognition.start();
}

// Promo code definitions
const PROMO_CODES = {
  'FREE2WEEKS2025': { type: 'free', description: 'Free 14‑day full access' },
  'HALFOFF2025': { type: 'discount', amount: 0.5, description: '50% discount' }
};

// Apply promo code on subscription page
function applyPromoCode() {
  const input = document.getElementById('promo-code');
  const message = document.getElementById('promo-message');
  if (!input || !message) return;
  const code = input.value.trim().toUpperCase();
  if (PROMO_CODES.hasOwnProperty(code)) {
    const promo = PROMO_CODES[code];
    if (promo.type === 'free') {
      message.textContent = `Promo code applied! ${promo.description}. Enjoy two weeks free.`;
    } else if (promo.type === 'discount') {
      message.textContent = `Promo code applied! ${promo.description}. Your next payment will be 50% off.`;
    }
    message.className = 'text-success';
  } else {
    message.textContent = 'Invalid promo code.';
    message.className = 'text-danger';
  }
}

// Simple AI tutor conversation logic
function generateTutorResponse(userText) {
  const lower = userText.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi')) {
    return 'Hello! It\'s nice to meet you. How can I help you with your English today?';
  }
  if (lower.includes('name')) {
    return 'You can call me the TwinsFluent AI Tutor.';
  }
  if (lower.includes('how are you')) {
    return 'I\'m just a program, but I\'m here to help you practise!';
  }
  if (lower.includes('help') || lower.includes('practice')) {
    return 'Let\'s practice! Try telling me about your day or asking a question.';
  }
  return 'Thanks for sharing. Could you tell me more?';
}

// Start an AI tutor conversation (voice)
function startTutorConversation() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert('Your browser does not support speech recognition.');
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recog = new SpeechRecognition();
  recog.lang = 'en-US';
  recog.interimResults = false;
  recog.maxAlternatives = 1;
  const conversationEl = document.getElementById('conversation');
  recog.onresult = (event) => {
    const userText = event.results[0][0].transcript;
    // show user message
    if (conversationEl) {
      const userDiv = document.createElement('div');
      userDiv.className = 'mb-2';
      userDiv.innerHTML = `<strong>You:</strong> ${userText}`;
      conversationEl.appendChild(userDiv);
    }
    const response = generateTutorResponse(userText);
    if (conversationEl) {
      const aiDiv = document.createElement('div');
      aiDiv.className = 'mb-2';
      aiDiv.innerHTML = `<strong>AI:</strong> ${response}`;
      conversationEl.appendChild(aiDiv);
    }
    // speak response
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(response);
      utter.lang = 'en-US';
      speechSynthesis.speak(utter);
    }
  };
  recog.onerror = (e) => console.error('AI tutor recognition error:', e.error);
  recog.start();
}

// Determine level from score
function getLevelInfo() {
  const score = parseInt(localStorage.getItem('twinsfluent_score') || '0', 10);
  let level = '';
  // Updated mapping for 12‑point test: 0–3: A1, 4–6: A2, 7–9: B1, 10–11: B2, 12+: C1
  if (score <= 3) level = 'A1';
  else if (score <= 6) level = 'A2';
  else if (score <= 9) level = 'B1';
  else if (score <= 11) level = 'B2';
  else level = 'C1';
  return { score, level };
}

// On dashboard or plan page, display level and plan details
function displayPlan() {
  const info = getLevelInfo();
  const levelEl = document.getElementById('level');
  const descEl = document.getElementById('level-desc');
  const planEl = document.getElementById('plan-details');
  if (descEl && levelEl) {
    levelEl.textContent = info.level;
    let description = '';
    let plan = '';
    switch (info.level) {
      case 'A1':
        description = 'You can communicate using familiar everyday expressions and very basic phrases【724991056186986†L109-L112】.';
        plan = '<ul><li>Learn basic vocabulary &amp; phrases</li><li>Practice introductions and simple questions</li><li>Focus on present simple tense</li><li>Use Read Along for pronunciation practice</li></ul>';
        break;
      case 'A2':
        description = 'You can use frequently used expressions and interact in simple and direct exchanges【724991056186986†L115-L120】.';
        plan = '<ul><li>Expand vocabulary on everyday topics</li><li>Practice past &amp; future tenses</li><li>Short dialogues with ChatGPT</li><li>Use Rewordify to simplify texts</li></ul>';
        break;
      case 'B1':
        description = 'You can understand information about familiar topics and communicate in most situations when travelling【724991056186986†L124-L129】.';
        plan = '<ul><li>Study connected text writing</li><li>Role‑play conversations with chatbots</li><li>Read short articles and summarise</li><li>Use Magic Write to brainstorm ideas</li></ul>';
        break;
      case 'B2':
        description = 'You can understand the main ideas of complex texts and interact with some fluency【724991056186986†L133-L138】.';
        plan = '<ul><li>Read and analyse opinion articles</li><li>Debate topics using AI chat</li><li>Write essays and get feedback</li><li>Prepare for advanced grammar</li></ul>';
        break;
      default:
        description = 'You can understand long, complex texts and express yourself fluently and spontaneously【724991056186986†L142-L155】.';
        plan = '<ul><li>Work on nuanced vocabulary &amp; idioms</li><li>Participate in debates &amp; presentations</li><li>Write research papers with AI assistance</li><li>Assist other learners in the forum</li></ul>';
        break;
    }
    descEl.innerHTML = description;
    if (planEl) planEl.innerHTML = plan;
  }
}

// Dashboard display for logged in user
function displayDashboard() {
  const user = JSON.parse(localStorage.getItem('twinsfluent_user') || '{}');
  const nameEl = document.getElementById('dashboard-name');
  const levelLabel = document.getElementById('dashboard-level');
  if (nameEl && user.name) {
    nameEl.textContent = user.name;
  }
  if (levelLabel) {
    const { level } = getLevelInfo();
    levelLabel.textContent = level || '—';
  }
}