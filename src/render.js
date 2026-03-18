import { APP_STATE } from "./stateMachine.js";

function setStatus(statusEl, appState) {
  const isGameOver = appState === APP_STATE.GAMEOVER;
  statusEl.classList.toggle("game-over", isGameOver);

  if (appState === APP_STATE.START) {
    statusEl.textContent = "Ready";
    return;
  }
  if (appState === APP_STATE.PAUSED) {
    statusEl.textContent = "Paused";
    return;
  }
  if (appState === APP_STATE.GAMEOVER) {
    statusEl.textContent = "Game Over";
    return;
  }
  statusEl.textContent = "Running";
}

export function createRenderer(elements) {
  const {
    boardEl,
    scoreEl,
    highScoreEl,
    statusEl,
    pauseBtn,
    startScreenEl,
    demoBtn,
    wrapToggleEl,
    specialToggleEl,
    obstacleToggleEl,
  } = elements;

  function render(viewModel) {
    const { state, appState, highScore, modeFlags } = viewModel;

    scoreEl.textContent = String(state.score);
    highScoreEl.textContent = String(highScore);
    setStatus(statusEl, appState);

    pauseBtn.textContent = appState === APP_STATE.PAUSED ? "Resume" : "Pause";
    pauseBtn.disabled = appState === APP_STATE.START || appState === APP_STATE.GAMEOVER;
    startScreenEl.classList.toggle("hidden", appState !== APP_STATE.START);

    demoBtn.textContent = modeFlags.demoMode ? "Demo: ON" : "Demo: OFF";
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
