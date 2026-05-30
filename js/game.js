const gameArea       = document.getElementById("gameArea");
const basket         = document.getElementById("basket");
const scoreEl        = document.getElementById("score");
const timeEl         = document.getElementById("time");
const bestScoreEl    = document.getElementById("bestScore");
const gameMessage    = document.getElementById("gameMessage");
const statusBtn      = document.getElementById("statusBtn");
const endOverlay     = document.getElementById("endOverlay");
const endEmoji       = document.getElementById("endEmoji");
const endTitle       = document.getElementById("endTitle");
const endScoreEl     = document.getElementById("endScore");
const starsRow       = document.getElementById("starsRow");
const comboDisplay   = document.getElementById("comboDisplay");
const timeBar        = document.getElementById("timeBar");
const restartBtn     = document.getElementById("restartBtn");
const changeLevelBtn = document.getElementById("changeLevelBtn");
const levelScreen    = document.getElementById("levelScreen");
const gameScreen     = document.getElementById("gameScreen");
const levelBadge     = document.getElementById("gameLevelBadge");
const newBestTag     = document.getElementById("newBestTag");

// ── INIT PIZZA STEVE BASKET ──────────────────────────────────
// Make Pizza Steve the basket character instead of 🍕
if (basket) {
  basket.innerHTML = `<img src="../assets/pizza-steve.png" alt="Pizza Steve" style="width: 55px; height: 55px; filter: drop-shadow(0 5px 10px rgba(255,140,0,0.45)); pointer-events: none;">`;
}

// ── DIFFICULTY CONFIG ──────────────────────────────────────
const LEVELS = {
  easy: {
    spawnMs: 1100,
    speedMin: 1.8,
    speedMax: 3.2,
    totalTime: 35,
    badRatio: 0.25,
    label: "Easy",
    cls: "lv-easy",
  },

  medium: {
    spawnMs: 800,
    speedMin: 2.5,
    speedMax: 4.5,
    totalTime: 30,
    badRatio: 0.35,
    label: "Medium",
    cls: "lv-medium",
  },

  hard: {
    spawnMs: 550,
    speedMin: 3.5,
    speedMax: 6.0,
    totalTime: 25,
    badRatio: 0.45,
    label: "Hard",
    cls: "lv-hard",
  },

  insane: {
    spawnMs: 320,
    speedMin: 5.0,
    speedMax: 9.0,
    totalTime: 20,
    badRatio: 0.55,
    label: "Insane",
    cls: "lv-insane",
  },
};

let currentLevel = "medium";
let score = 0;
let timeLeft = 30;
let gameRunning = false;
let combo = 0;
let comboTimer = null;

let spawnInterval;
let timerInterval;

// ── TOPPINGS ───────────────────────────────────────────────
const toppingsMap = {
  Olive: null,
"Sweet Pepper": null,
  Corn: "🌽",
  Cheese: "🧀",
};


const oliveSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 130" width="36" height="36">
  <defs>
    <linearGradient id="og" x1="0%" y1="0%" x2="60%" y2="100%">
      <stop offset="0%" stop-color="#7ab648"/>
      <stop offset="100%" stop-color="#3d6b1a"/>
    </linearGradient>

    <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d4441a"/>
      <stop offset="100%" stop-color="#a82c0a"/>
    </linearGradient>
  </defs>

  <ellipse cx="80" cy="68" rx="46" ry="56" fill="url(#og)"/>
  <ellipse cx="72" cy="56" rx="14" ry="10" fill="rgba(255,255,255,0.13)"/>
  <ellipse cx="80" cy="68" rx="16" ry="20" fill="url(#hg)"/>
  <ellipse cx="76" cy="62" rx="5" ry="4" fill="rgba(255,160,100,0.25)"/>
  <ellipse cx="80" cy="68" rx="7" ry="9" fill="#7b1e05"/>

  <path d="M80 12 C90 2 115 8 110 22 C105 30 88 24 80 12Z" fill="#5a9e2a"/>
  <path d="M80 12 C78 4 90 0 92 8" fill="none" stroke="#3d6b1a" stroke-width="2" stroke-linecap="round"/>
</svg>
`;
const sweetPepperSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="38" height="38">

  <defs>
    <linearGradient id="pepperBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8dff6d"/>
      <stop offset="50%" stop-color="#46c33d"/>
      <stop offset="100%" stop-color="#248c2d"/>
    </linearGradient>

    <linearGradient id="pepperStem" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7a5a28"/>
      <stop offset="100%" stop-color="#4a3412"/>
    </linearGradient>
  </defs>

  <path
    d="M80 28
       C105 15 128 30 128 60
       C128 102 112 132 80 138
       C48 132 32 102 32 60
       C32 30 55 15 80 28Z"
    fill="url(#pepperBody)"
  />

  <path
    d="M80 28
       C88 48 88 88 80 138"
    stroke="#2c7d24"
    stroke-width="4"
    opacity="0.4"
  />

  <ellipse
    cx="62"
    cy="58"
    rx="12"
    ry="26"
    fill="rgba(255,255,255,0.18)"
    transform="rotate(-20 62 58)"
  />

  <path
    d="M80 20
       C75 10 86 2 95 8
       C102 12 102 22 94 28"
    fill="none"
    stroke="url(#pepperStem)"
    stroke-width="7"
    stroke-linecap="round"
  />

</svg>
`;

const allToppings = [
  "Olive",
  "Sweet Pepper",
  "Corn",
  "Cheese"
];
const badItems = {
  Pepper: "🌶️",
  Onion: "🧅",
  Broccoli: "🥦",
};

// ── GET SELECTED TOPPINGS FROM ORDER ──────────────────────
function getSelectedToppings() {
  try {
    // First try to read game toppings
    const gameToppings = JSON.parse(localStorage.getItem("pizza_go_game_toppings") || "[]");

    if (Array.isArray(gameToppings) && gameToppings.length > 0) {
      return gameToppings;
    }

    // If empty, read the original order
    const order = JSON.parse(localStorage.getItem("pizza_go_order") || "{}");

    // toppingsList
    if (order.toppingsList && Array.isArray(order.toppingsList)) {
      return order.toppingsList;
    }

    // toppings object
    if (order.toppings && typeof order.toppings === "object") {
      return Object.keys(order.toppings).filter(name =>
        order.toppings[name] === true || order.toppings[name] === 1
      );
    }

    return [];
  } catch(err) {
    console.log(err);
    return [];
  }
}

let selectedToppings = [];

// ── BEST SCORE ─────────────────────────────────────────────
function getBestScore(level) {
  return parseInt(localStorage.getItem(`best_${level}`) || "0", 10);
}

function saveBestScore(level, val) {
  localStorage.setItem(`best_${level}`, val);
}

// ── SCREENS ────────────────────────────────────────────────
function showLevelScreen() {
  gameScreen.classList.add("hidden");
  levelScreen.classList.remove("hidden");

  document.querySelectorAll(".level-btn").forEach((btn) => {
    const lv = btn.dataset.level;
    const best = getBestScore(lv);

    let bestEl = btn.querySelector(".lv-best");

    if (!bestEl) {
      bestEl = document.createElement("span");
      bestEl.className = "lv-best";
      btn.appendChild(bestEl);
    }

    bestEl.textContent = best > 0 ? `Best: ${best}` : "";
  });
}

function showGameScreen() {
  levelScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
}

// ── LEVEL BUTTONS ──────────────────────────────────────────
document.querySelectorAll(".level-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentLevel = btn.dataset.level;
    selectedToppings = getSelectedToppings();
    
    console.log("pizza_go_game_toppings:", localStorage.getItem("pizza_go_game_toppings"));
    console.log("pizza_go_order:", localStorage.getItem("pizza_go_order"));
    console.log("SELECTED:", selectedToppings);

    showGameScreen();
    buildHints();
    startGame();
  });
});

changeLevelBtn.addEventListener("click", () => {
  stopGame();
  showLevelScreen();
});

showLevelScreen();

// ── BUILD HINTS ────────────────────────────────────────────
function buildHints() {
  const wrap = document.getElementById("toppingsHint");
  wrap.innerHTML = "";

  selectedToppings.forEach((t) => {
    const chip = document.createElement("div");
    chip.className = "hint-chip";

    if (t === "Olive") {
      chip.innerHTML = `
        <span class="hint-olive-icon">${oliveSVG}</span>
        <span>${t}</span>
      `;
    }
    else if (t === "Sweet Pepper") {
      chip.innerHTML = `
        <span class="hint-olive-icon">${sweetPepperSVG}</span>
        <span>${t}</span>
      `;
    }
    else {
      chip.innerHTML = `${toppingsMap[t] || t}<span>${t}</span>`;
    }

    wrap.appendChild(chip);
  });
}

// ── GAME START ─────────────────────────────────────────────
function startGame() {
  const cfg = LEVELS[currentLevel];

  gameRunning = true;
  score = 0;
  timeLeft = cfg.totalTime;
  combo = 0;

  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;

  timeEl.classList.remove("urgent");

  timeBar.style.width = "100%";
  timeBar.style.transition = "width 1s linear";

  bestScoreEl.textContent = getBestScore(currentLevel);

  levelBadge.textContent = cfg.label;
  levelBadge.className = `level-badge-inline ${cfg.cls}`;

  endOverlay.classList.remove("visible");
  statusBtn.disabled = true;
  newBestTag.classList.add("hidden");

  setMessage("🍕 Catch ONLY your toppings!", "");

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  spawnInterval = setInterval(createFallingItem, cfg.spawnMs);

  timerInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    timeBar.style.width = (timeLeft / cfg.totalTime) * 100 + "%";

    if (timeLeft <= 6) {
      timeEl.classList.add("urgent");
    }

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// ── STOP GAME ──────────────────────────────────────────────
function stopGame() {
  gameRunning = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  document.querySelectorAll(".topping, .catch-burst, .particle").forEach((e) => e.remove());
}

// ── END GAME ───────────────────────────────────────────────
function endGame() {
  stopGame();

  const prev = getBestScore(currentLevel);
  const isNew = score > prev;

  if (isNew) {
    saveBestScore(currentLevel, score);
  }

  bestScoreEl.textContent = getBestScore(currentLevel);
  endScoreEl.textContent = score;

  if (isNew && score > 0) {
    newBestTag.classList.remove("hidden");
  }

  let emoji;
  let title;
  let stars;

  const thresholds = {
    easy: [10, 5],
    medium: [16, 8],
    hard: [20, 10],
    insane: [24, 12],
  };

  const [hi, mid] = thresholds[currentLevel];

  if (score >= hi) {
    emoji = "🏆";
    title = "Pizza Master!";
    stars = "⭐⭐⭐";
  } else if (score >= mid) {
    emoji = `<img src="../assets/pizza-steve.png" class="end-pizza-steve" alt="Pizza Steve">`;
    title = "Great Catch!";
    stars = "⭐⭐";
  } else {
    emoji = "🍕";
    title = "Keep Trying!";
    stars = "⭐";
  }

  endEmoji.innerHTML = emoji;
  endTitle.textContent = title;
  starsRow.textContent = stars;

  endOverlay.classList.add("visible");
  statusBtn.disabled = false;
}

// ── CREATE FALLING ITEMS ───────────────────────────────────
function createFallingItem() {
  if (!gameRunning) return;

  const cfg = LEVELS[currentLevel];
  const areaW = gameArea.clientWidth;
  let name;

  if (Math.random() < cfg.badRatio) {
    const bads = Object.keys(badItems);
    name = bads[Math.floor(Math.random() * bads.length)];
  } else {
    if (selectedToppings.length === 0) {
      setMessage("⚠️ No toppings found. Please choose toppings first.", "flash-bad");
      return;
    }
    name = selectedToppings[Math.floor(Math.random() * selectedToppings.length)];
  }

  const isGood = selectedToppings.some((t) => {
    const cleanT = String(t).toLowerCase().trim();
    const cleanName = String(name).toLowerCase().trim();
    return cleanT.includes(cleanName) || cleanName.includes(cleanT);
  });

  const emoji = toppingsMap[name] || badItems[name];
  const el = document.createElement("div");
  el.className = "topping " + (isGood ? "good" : "bad");
  el.dataset.name = name;

if (name === "Olive") {
  el.innerHTML = oliveSVG;
}
else if (name === "Sweet Pepper") {
  el.innerHTML = sweetPepperSVG;
}
else {
  el.textContent = emoji;
}

  const itemW = 40;
  const randomX = itemW + Math.random() * (areaW - itemW * 2);
  el.style.left = `${randomX}px`;
  gameArea.appendChild(el);

  let y = -60;
  const spd = cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin);
  const drift = currentLevel === "insane" ? (Math.random() - 0.5) * 1.2 : 0;
  let curX = randomX;

  const fall = setInterval(() => {
    if (!gameRunning) {
      clearInterval(fall);
      el.remove();
      return;
    }

    y += spd;
    curX += drift;
    el.style.top = `${y}px`;
    el.style.left = `${Math.max(0, Math.min(areaW - itemW, curX))}px`;

    if (checkCollision(el, basket)) {
      handleCatch(name, isGood, curX, y);
      clearInterval(fall);
      el.remove();
    } else if (y > gameArea.clientHeight) {
      if (isGood) breakCombo();
      clearInterval(fall);
      el.remove();
    }
  }, 16);
}

// ── HANDLE CATCH ───────────────────────────────────────────
function handleCatch(name, isGood, x, y) {
  if (isGood) {
    combo++;
    const bonus = combo >= 5 ? 5 : combo >= 3 ? 3 : 2;
    score += bonus;
    clearTimeout(comboTimer);
    comboTimer = setTimeout(breakCombo, 2500);

    if (combo >= 2) {
      comboDisplay.textContent = `${combo}x COMBO 🔥`;
      comboDisplay.classList.add("visible");
      setTimeout(() => comboDisplay.classList.remove("visible"), 1200);
    }

    const msg = combo >= 5
      ? `🔥🔥 ${combo}x INSANE! +${bonus}`
      : combo >= 3
      ? `🔥 ${combo}x COMBO! +${bonus}`
      : combo >= 2
      ? `✅ ${name} +${bonus} (combo!)`
      : `✅ ${name} added +${bonus}`;

    setMessage(msg, "flash-good");
    spawnBurst(x, y, true, bonus);
  } else {
    breakCombo();
    score = Math.max(0, score - 1);
    setMessage(`❌ ${name} — wrong topping! -1`, "flash-bad");
    spawnBurst(x, y, false, 1);
    shakeBasket();
  }

  scoreEl.textContent = score;
}

// ── COMBO ──────────────────────────────────────────────────
function breakCombo() {
  combo = 0;
  clearTimeout(comboTimer);
  comboDisplay.classList.remove("visible");
}

// ── MESSAGE ────────────────────────────────────────────────
function setMessage(text, cls) {
  gameMessage.textContent = text;
  gameMessage.className = "game-message" + (cls ? " " + cls : "");
  if (cls) {
    setTimeout(() => {
      gameMessage.className = "game-message";
    }, 900);
  }
}

// ── EFFECTS ────────────────────────────────────────────────
function spawnBurst(x, y, isGood, val) {
  const burst = document.createElement("div");
  burst.className = "catch-burst " + (isGood ? "good-burst" : "bad-burst");
  burst.textContent = isGood ? `+${val}` : `-1`;
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;
  gameArea.appendChild(burst);
  setTimeout(() => burst.remove(), 800);
}

function shakeBasket() {
  basket.style.transform = "translateX(-50%) translateX(-7px) rotate(-6deg)";
  setTimeout(() => {
    basket.style.transform = "translateX(-50%) translateX(7px) rotate(6deg)";
    setTimeout(() => {
      basket.style.transform = "translateX(-50%)";
    }, 80);
  }, 80);
}

// ── COLLISION ──────────────────────────────────────────────
function checkCollision(a, b) {
  const rA = a.getBoundingClientRect();
  const rB = b.getBoundingClientRect();
  return !(rA.bottom < rB.top || rA.top > rB.bottom || rA.right < rB.left || rA.left > rB.right);
}

// ── MOVE BASKET ────────────────────────────────────────────
function moveBasket(clientX) {
  const rect = gameArea.getBoundingClientRect();
  const halfW = 44;
  let x = clientX - rect.left;
  x = Math.max(halfW, Math.min(gameArea.clientWidth - halfW, x));
  basket.style.left = `${x}px`;
}

gameArea.addEventListener("mousemove", (e) => {
  moveBasket(e.clientX);
});

gameArea.addEventListener("touchmove", (e) => {
  e.preventDefault();
  moveBasket(e.touches[0].clientX);
}, { passive: false });

// ── BUTTONS ────────────────────────────────────────────────
restartBtn.addEventListener("click", startGame);

statusBtn.addEventListener("click", () => {
window.location.href = "./status.html";
});