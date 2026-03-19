import { APP_STATE } from "./stateMachine.js";
import { getText } from "./i18n.js";

function setStatus(statusEl, appState, language) {
  const isGameOver = appState === APP_STATE.GAMEOVER;
  statusEl.classList.toggle("game-over", isGameOver);

  if (appState === APP_STATE.START) {
    statusEl.textContent = getText(language, "ready");
    return;
  }
  if (appState === APP_STATE.PAUSED) {
    statusEl.textContent = getText(language, "paused");
    return;
  }
  if (appState === APP_STATE.GAMEOVER) {
    statusEl.textContent = getText(language, "gameOver");
    return;
  }
  statusEl.textContent = getText(language, "running");
}

export function createRenderer(elements) {
  const {
    boardEl,
    scoreEl,
    highScoreEl,
    statusEl,
    pauseBtn,
    restartBtn,
    startBtn,
    startScreenEl,
    demoBtn,
    wrapToggleEl,
    specialToggleEl,
    obstacleToggleEl,
    titleEl,
    startMessageEl,
    scoreLabelEl,
    highLabelEl,
    wrapLabelEl,
    specialLabelEl,
    obstacleLabelEl,
    upBtn,
    leftBtn,
    downBtn,
    rightBtn,
    hintEl,
    languageLabelEl,
    languageSelectEl,
  } = elements;

  function render(viewModel) {
    const { state, appState, highScore, modeFlags, language } = viewModel;

    scoreEl.textContent = String(state.score);
    highScoreEl.textContent = String(highScore);

    titleEl.textContent = getText(language, "title");
    startMessageEl.textContent = getText(language, "startMessage");
    scoreLabelEl.textContent = getText(language, "score");
    highLabelEl.textContent = getText(language, "high");
    wrapLabelEl.textContent = getText(language, "wrapWalls");
    specialLabelEl.textContent = getText(language, "specialFood");
    obstacleLabelEl.textContent = getText(language, "obstacles");
    upBtn.textContent = getText(language, "up");
    leftBtn.textContent = getText(language, "left");
    downBtn.textContent = getText(language, "down");
    rightBtn.textContent = getText(language, "right");
    hintEl.textContent = getText(language, "hint");
    languageLabelEl.textContent = getText(language, "language");
    languageSelectEl.value = language;
    startBtn.textContent = getText(language, "start");
    restartBtn.textContent = getText(language, "restart");

    setStatus(statusEl, appState, language);

    pauseBtn.textContent =
      appState === APP_STATE.PAUSED ? getText(language, "resume") : getText(language, "pause");
    pauseBtn.disabled = appState === APP_STATE.START || appState === APP_STATE.GAMEOVER;
    startScreenEl.classList.toggle("hidden", appState !== APP_STATE.START);

    demoBtn.textContent = modeFlags.demoMode ? getText(language, "demoOn") : getText(language, "demoOff");
    wrapToggleEl.checked = modeFlags.wrapWalls;
    specialToggleEl.checked = modeFlags.specialFood;
    obstacleToggleEl.checked = modeFlags.obstacleMode;

    const snakeSet = new Set(state.snake.map((part) => `${part.x},${part.y}`));
    const foodKey = state.food ? `${state.food.x},${state.food.y}` : "";
    const specialKey = state.specialFood
      ? `${state.specialFood.x},${state.specialFood.y}`
      : "";
    const obstacleSet = new Set((state.obstacles || []).map((part) => `${part.x},${part.y}`));

    boardEl.innerHTML = "";
    for (let y = 0; y < state.gridHeight; y += 1) {
      for (let x = 0; x < state.gridWidth; x += 1) {
        const cell = document.createElement("div");
        cell.className = "cell";
        const key = `${x},${y}`;
        if (snakeSet.has(key)) {
          cell.classList.add("snake");
        } else if (obstacleSet.has(key)) {
          cell.classList.add("obstacle");
        } else if (foodKey === key) {
          cell.classList.add("food");
        } else if (specialKey === key) {
          cell.classList.add("food-special");
        }
        boardEl.appendChild(cell);
      }
    }
  }

  return { render };
}
