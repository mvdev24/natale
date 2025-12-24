const SECRET_ANSWERS = new Set([
  "10 giugno",
  "10/6",
  "10/06",
  "giugno 10",
  "10-6",
  "10giu",
  "10 giu",
]);

const music = document.getElementById("music");
const laugh = document.getElementById("laugh");
const MUSIC_BASE_VOLUME = 0.4;

document.getElementById("secretForm").addEventListener("submit", function (e) {
  e.preventDefault();
  checkSecret();
});

document.addEventListener("DOMContentLoaded", () => {
  animateScreen("login");
});

function checkSecret() {
  const inputEl = document.getElementById("secretInput");
  const value = inputEl.value.toLowerCase().trim();
  const errorEl = document.querySelector("#login .error");

  if (SECRET_ANSWERS.has(value)) {
    errorEl.classList.add("hidden");
    goTo("start");
    playMusic();
  } else {
    errorEl.classList.remove("hidden");
    errorEl.classList.add("shake");
    playLaugh();
    setTimeout(() => errorEl.classList.remove("shake"), 400);
  }
}

function playMusic() {
  music.volume = MUSIC_BASE_VOLUME;
  music.play();
}

function playLaugh() {
  // duck music slightly and restart laugh each time
  duckMusic(0.2);
  laugh.pause();
  laugh.currentTime = 0;
  laugh.volume = 0.7;
  laugh.play();
  laugh.addEventListener(
    "ended",
    () => {
      restoreMusic();
    },
    { once: true }
  );
}

// Subtle volume ducking for background music
function duckMusic(to = 0.25) {
  try {
    music.volume = to;
  } catch {}
}

function restoreMusic() {
  try {
    music.volume = MUSIC_BASE_VOLUME;
  } catch {}
}

// Subtle chime for correct answers using WebAudio (no extra assets)
let audioCtx;
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playCorrect() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    duckMusic(0.22);

    const notes = [1047, 1319, 1568]; // C6-E6-G6, suono "campanellina" natalizia
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const startT = now + i * 0.08;
      const endT = startT + 0.22;
      gain.gain.setValueAtTime(0, startT);
      gain.gain.linearRampToValueAtTime(0.16, startT + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, endT);
      osc.connect(gain).connect(ctx.destination);
      osc.start(startT);
      osc.stop(endT + 0.01);
    });

    setTimeout(restoreMusic, 380);
  } catch {}
}

function startExperience() {
  goTo("step1");
}

const TYPE_SPEED = 45;

function typeText(el, textContent, speed = TYPE_SPEED) {
  return new Promise((resolve) => {
    if (!el) return resolve();
    const textValue = textContent ?? el.textContent ?? "";
    el.dataset.text = textValue;
    el.textContent = "";
    el.classList.add("visible-type");
    let i = 0;

    const tick = () => {
      el.textContent += textValue.charAt(i);
      i += 1;
      if (i < textValue.length) {
        setTimeout(tick, speed);
      } else {
        resolve();
      }
    };

    tick();
  });
}

async function animateQuestion(questionEl) {
  if (!questionEl) return;
  const textEl = questionEl.querySelector(".type-me");
  const original = textEl?.dataset.text || textEl?.textContent;
  if (textEl && original) {
    await typeText(textEl, original, TYPE_SPEED);
  }
  const options = questionEl.querySelector(".options");
  if (options) {
    options.classList.remove("hidden");
    options.classList.add("fade-in");
  }
}

async function animateScreen(id) {
  const screen = document.getElementById(id);
  if (!screen) return;

  const visibleTypeTargets = Array.from(
    screen.querySelectorAll(".type-me")
  ).filter((el) => !el.closest(".hidden"));

  for (const el of visibleTypeTargets) {
    const content = el.dataset.text || el.textContent;
    await typeText(el, content, TYPE_SPEED);

    const questionEl = el.closest(".question");
    if (questionEl) {
      const options = questionEl.querySelector(".options");
      if (options) {
        options.classList.remove("hidden");
        options.classList.add("fade-in");
      }
    }
  }
}

function goTo(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  if (id === "start") {
    const startBtn = document.querySelector("#start button");
    if (startBtn) startBtn.classList.add("hidden");
    animateScreen(id).then(() => {
      if (startBtn) {
        startBtn.classList.remove("hidden");
        startBtn.classList.add("fade-in");
      }
    });
  } else {
    animateScreen(id);
  }
}

function answerStep(step, part, correct) {
  const stepEl = document.getElementById(`step${step}`);
  const question1 = stepEl.querySelector(".question-1");
  const question2 = stepEl.querySelector(".question-2");
  const reward = stepEl.querySelector(".reward");
  const error1 = stepEl.querySelector(".error-1");
  const error2 = stepEl.querySelector(".error-2");

  if (part === 1) {
    if (correct) {
      error1.classList.add("hidden");
      question1.classList.add("hidden");
      question2.classList.remove("hidden");
      playCorrect();
      animateQuestion(question2);
    } else {
      error1.classList.remove("hidden");
      error1.classList.add("shake");
      playLaugh();
      setTimeout(() => error1.classList.remove("shake"), 400);
    }
  }

  if (part === 2) {
    if (correct) {
      error2.classList.add("hidden");
      reward.classList.remove("hidden");
      reward.classList.add("pop-in");
      burstConfetti(reward);
      playCorrect();
    } else {
      error2.classList.remove("hidden");
      error2.classList.add("shake");
      playLaugh();
      setTimeout(() => error2.classList.remove("shake"), 400);
    }
  }
}

const canvas = document.getElementById("snowCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Snowflake {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 6 + 2;
    this.speed = Math.random() * 1 + 0.5;
    this.angle = Math.random() * Math.PI * 2;
    this.rotationSpeed = Math.random() * 0.02 - 0.01;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    // disegno fiocco base a 6 punte
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, this.size);
      ctx.stroke();
    }
    ctx.restore();
  }

  update() {
    this.y += this.speed;
    this.angle += this.rotationSpeed;
    this.x += Math.sin(this.angle) * 0.5;
    if (this.y > canvas.height + this.size) {
      this.y = -this.size;
      this.x = Math.random() * canvas.width;
    }
  }
}

const snowflakes = [];
for (let i = 0; i < 100; i++) {
  snowflakes.push(new Snowflake());
}

function animateSnow() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  snowflakes.forEach((f) => {
    f.update();
    f.draw();
  });
  requestAnimationFrame(animateSnow);
}

animateSnow();

// Aggiorna canvas al resize finestra
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Lightweight confetti burst inside reward containers
function burstConfetti(container) {
  if (!container) return;
  const cvs = document.createElement("canvas");
  cvs.className = "confetti-canvas";
  container.appendChild(cvs);

  const dpr = window.devicePixelRatio || 1;
  const rect = container.getBoundingClientRect();
  cvs.width = rect.width * dpr;
  cvs.height = rect.height * dpr;
  cvs.style.width = rect.width + "px";
  cvs.style.height = rect.height + "px";
  const c = cvs.getContext("2d");
  c.scale(dpr, dpr);

  const colors = [
    getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() || "#b83b5e",
    getComputedStyle(document.documentElement).getPropertyValue("--color-accent-green").trim() || "#2f6f4e",
    getComputedStyle(document.documentElement).getPropertyValue("--color-gold").trim() || "#cc9d2f",
    "#ffffff"
  ];

  const N = 80;
  const particles = Array.from({ length: N }, () => ({
    x: Math.random() * rect.width,
    y: -10 - Math.random() * 30,
    vx: (Math.random() - 0.5) * 2,
    vy: 2 + Math.random() * 2.5,
    r: 2 + Math.random() * 3,
    a: 1,
    color: colors[Math.floor(Math.random() * colors.length)],
    spin: Math.random() * Math.PI * 2,
    spinSpeed: (Math.random() - 0.5) * 0.2
  }));

  let running = true;
  const start = performance.now();

  function step(t) {
    const elapsed = t - start;
    c.clearRect(0, 0, rect.width, rect.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02; // gravity
      p.spin += p.spinSpeed;
      p.a = Math.max(0, 1 - elapsed / 1200);

      c.save();
      c.globalAlpha = p.a;
      c.translate(p.x, p.y);
      c.rotate(p.spin);
      c.fillStyle = p.color;
      c.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
      c.restore();
    });

    if (elapsed < 1200 && running) {
      requestAnimationFrame(step);
    } else {
      running = false;
      cvs.remove();
    }
  }

  requestAnimationFrame(step);
}
