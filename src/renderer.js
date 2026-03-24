import { GAME_STATES } from "./stateManager.js";

function drawRoundedRect(ctx, x, y, width, height, radius) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
    return;
  }

  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
  ctx.fill();
}

function renderLeaderboardRows(entries) {
  if (entries.length === 0) {
    return '<li><span class="rank">-</span><span>NO SCORES YET</span><span class="score">0</span></li>';
  }

  return entries
    .map(
      (entry, index) =>
        `<li><span class="rank">#${index + 1}</span><span>${entry.name}</span><span class="score">${entry.score}</span></li>`
    )
    .join("");
}

export function createRenderer({
  canvas,
  scoreEl,
  highScoreEl,
  overlayEl,
  overlayTitleEl,
  overlayMessageEl,
  overlayActionBtn,
  pauseBtn,
  viewLeaderboardBtn,
  leaderboardPanel,
  leaderboardList,
  backMenuBtn,
  nameEntry,
  playerNameInput,
  saveScoreBtn,
}) {
  const ctx = canvas.getContext("2d");
  let palette = {
    boardBg: "#0b1425",
    boardLine: "rgba(148, 163, 184, 0.08)",
    snakeHead: "#6ee7b7",
    snakeBody: "#34d399",
    foodCore: "#fb7185",
    foodGlow: "rgba(248, 113, 113, 0.96)",
  };

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function drawBoard(state) {
    const size = canvas.width;
    const cell = size / state.gridSize;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = palette.boardBg;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = palette.boardLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < state.gridSize; i += 1) {
      const p = Math.round(i * cell) + 0.5;
      ctx.moveTo(p, 0);
      ctx.lineTo(p, size);
      ctx.moveTo(0, p);
      ctx.lineTo(size, p);
    }
    ctx.stroke();
  }

  function drawFood(state, nowMs) {
    const cell = canvas.width / state.gridSize;
    const pulse = 0.18 + (Math.sin(nowMs / 120) + 1) * 0.08;
    const centerX = (state.food.x + 0.5) * cell;
    const centerY = (state.food.y + 0.5) * cell;
    const radius = cell * (0.24 + pulse);

    const glow = ctx.createRadialGradient(centerX, centerY, cell * 0.05, centerX, centerY, cell * 0.75);
    glow.addColorStop(0, palette.foodGlow);
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, cell * 0.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = palette.foodCore;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSnake(state) {
    const cell = canvas.width / state.gridSize;

    state.snake.forEach((segment, index) => {
      const x = segment.x * cell + cell * 0.06;
      const y = segment.y * cell + cell * 0.06;
      const size = cell * 0.88;
      const radius = cell * 0.26;

      const alpha = index === 0 ? 1 : Math.max(0.55, 1 - index * 0.04);
      const color = index === 0 ? palette.snakeHead : palette.snakeBody;

      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      drawRoundedRect(ctx, x, y, size, size, radius);
      ctx.globalAlpha = 1;
    });
  }

  function setHidden(element, hidden) {
    element.classList.toggle("hidden", hidden);
  }

  function updateUi(state, viewModel) {
    const { leaderboardEntries, scoreSaved } = viewModel;

    scoreEl.textContent = String(state.score);
    highScoreEl.textContent = String(state.highScore);

    leaderboardList.innerHTML = renderLeaderboardRows(leaderboardEntries);

    const inOverlay = state.gameState !== GAME_STATES.PLAYING;
    setHidden(overlayEl, !inOverlay);

    setHidden(nameEntry, true);
    setHidden(leaderboardPanel, true);
    setHidden(viewLeaderboardBtn, true);
    setHidden(overlayActionBtn, true);
    setHidden(backMenuBtn, true);
    saveScoreBtn.disabled = false;

    pauseBtn.textContent = state.gameState === GAME_STATES.PAUSED ? "Resume (P)" : "Pause (P)";

    if (state.gameState === GAME_STATES.PLAYING) {
      document.body.classList.remove("game-over");
      return;
    }

    if (state.gameState === GAME_STATES.START) {
      overlayTitleEl.textContent = "Modern Snake";
      overlayMessageEl.textContent = "Press Start to begin.";
      overlayActionBtn.textContent = "Start";
      setHidden(overlayActionBtn, false);
      setHidden(viewLeaderboardBtn, false);
      document.body.classList.remove("game-over");
      return;
    }

    if (state.gameState === GAME_STATES.PAUSED) {
      overlayTitleEl.textContent = "Paused";
      overlayMessageEl.textContent = "Press P or Resume.";
      overlayActionBtn.textContent = "Resume";
      setHidden(overlayActionBtn, false);
      document.body.classList.remove("game-over");
      return;
    }

    if (state.gameState === GAME_STATES.LEADERBOARD) {
      overlayTitleEl.textContent = "Leaderboard";
      overlayMessageEl.textContent = "Top 10 scores";
      setHidden(leaderboardPanel, false);
      setHidden(backMenuBtn, false);
      document.body.classList.remove("game-over");
      return;
    }

    overlayTitleEl.textContent = "Game Over";
    overlayMessageEl.textContent = scoreSaved ? "Score saved." : "Enter name, save score, then restart.";
    overlayActionBtn.textContent = "Restart";
    setHidden(nameEntry, false);
    setHidden(viewLeaderboardBtn, false);
    setHidden(overlayActionBtn, false);
    saveScoreBtn.disabled = scoreSaved;
    document.body.classList.add("game-over");
  }

  return {
    setTheme(nextPalette) {
      palette = { ...palette, ...nextPalette };
    },

    render(state, nowMs, viewModel) {
      resizeCanvas();
      drawBoard(state);
      drawFood(state, nowMs);
      drawSnake(state);
      updateUi(state, viewModel);
    },

    focusNameInput() {
      playerNameInput.focus();
      playerNameInput.select();
    },
  };
}
