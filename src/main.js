import { createGameEngine } from "./gameEngine.js";
import { createInputController } from "./inputController.js";
import { createLeaderboardManager } from "./leaderboardManager.js";
import { createRenderer } from "./renderer.js";
import { GAME_STATES, createStateManager } from "./stateManager.js";
import { createSoundEffects } from "./soundEffects.js";
import { createThemeManager } from "./themeManager.js";

const elements = {
  canvas: document.getElementById("game-canvas"),
  scoreEl: document.getElementById("score"),
  highScoreEl: document.getElementById("high-score"),
  themeSelect: document.getElementById("theme-select"),
  overlayEl: document.getElementById("overlay"),
  overlayTitleEl: document.getElementById("overlay-title"),
  overlayMessageEl: document.getElementById("overlay-message"),
  overlayActionBtn: document.getElementById("overlay-action"),
  pauseBtn: document.getElementById("pause-btn"),
  viewLeaderboardBtn: document.getElementById("view-leaderboard-btn"),
  leaderboardPanel: document.getElementById("leaderboard-panel"),
  leaderboardList: document.getElementById("leaderboard-list"),
  backMenuBtn: document.getElementById("back-menu-btn"),
  nameEntry: document.getElementById("name-entry"),
  playerNameInput: document.getElementById("player-name"),
  saveScoreBtn: document.getElementById("save-score-btn"),
  directionButtons: Array.from(document.querySelectorAll("[data-dir]")),
};

const stateManager = createStateManager();
const leaderboardManager = createLeaderboardManager();
const sounds = createSoundEffects();
const themeManager = createThemeManager();

let leaderboardEntries = leaderboardManager.getEntries();
let scoreSavedForRound = false;
let pendingScore = 0;

elements.playerNameInput.value = leaderboardManager.getLastPlayerName();

const engine = createGameEngine({
  stateManager,
  onEat: () => sounds.playEat(),
  onGameOver: () => {
    sounds.playGameOver();
    pendingScore = stateManager.getState().score;
    scoreSavedForRound = false;
  },
});

const renderer = createRenderer(elements);
const initialTheme = themeManager.applyTheme(themeManager.getInitialTheme());
elements.themeSelect.value = initialTheme;
renderer.setTheme(themeManager.getPalette(initialTheme));

function sanitizeName(name) {
  return leaderboardManager.normalizeName(name);
}

function savePendingScore() {
  if (scoreSavedForRound) {
    return;
  }

  const name = sanitizeName(elements.playerNameInput.value);
  elements.playerNameInput.value = name;

  leaderboardEntries = leaderboardManager.saveScore(name, pendingScore);
  scoreSavedForRound = true;
}

function setGameState(nextState) {
  stateManager.update((draft) => {
    draft.gameState = nextState;
  });
}

function showLeaderboard() {
  leaderboardEntries = leaderboardManager.getEntries();
  setGameState(GAME_STATES.LEADERBOARD);
}

function goToMenu() {
  setGameState(GAME_STATES.START);
}

function restartGame() {
  // Ensure each game-over round can be persisted even if user skips the save button.
  if (stateManager.getState().gameState === GAME_STATES.GAME_OVER) {
    savePendingScore();
  }

  sounds.unlock();
  engine.restart();
}

function handlePrimaryAction() {
  const state = stateManager.getState();

  if (state.gameState === GAME_STATES.START) {
    sounds.unlock();
    engine.start();
    return;
  }

  if (state.gameState === GAME_STATES.PAUSED) {
    engine.togglePause();
    return;
  }

  if (state.gameState === GAME_STATES.GAME_OVER) {
    restartGame();
  }
}

createInputController({
  canvas: elements.canvas,
  directionButtons: elements.directionButtons,
  onDirection: (direction) => {
    sounds.unlock();
    engine.queueDirection(direction);
  },
  onPauseToggle: () => {
    sounds.unlock();
    engine.togglePause();
  },
  onRestart: restartGame,
  onPrimaryAction: handlePrimaryAction,
});

elements.overlayActionBtn.addEventListener("click", handlePrimaryAction);

elements.pauseBtn.addEventListener("click", () => {
  sounds.unlock();
  engine.togglePause();
});

elements.viewLeaderboardBtn.addEventListener("click", () => {
  showLeaderboard();
});

elements.backMenuBtn.addEventListener("click", () => {
  goToMenu();
});

elements.saveScoreBtn.addEventListener("click", () => {
  savePendingScore();
  showLeaderboard();
});

elements.themeSelect.addEventListener("change", (event) => {
  const themeName = themeManager.applyTheme(event.target.value);
  renderer.setTheme(themeManager.getPalette(themeName));
});

elements.playerNameInput.addEventListener("input", () => {
  if (elements.playerNameInput.value.length > leaderboardManager.maxNameLength) {
    elements.playerNameInput.value = elements.playerNameInput.value.slice(0, leaderboardManager.maxNameLength);
  }
});

let lastTimeMs = performance.now();
let lastGameState = stateManager.getState().gameState;

function loop(nowMs) {
  const deltaMs = nowMs - lastTimeMs;
  lastTimeMs = nowMs;

  engine.update(deltaMs);

  const state = stateManager.getState();
  if (state.gameState !== lastGameState && state.gameState === GAME_STATES.GAME_OVER) {
    renderer.focusNameInput();
  }

  lastGameState = state.gameState;

  renderer.render(state, nowMs, {
    leaderboardEntries,
    scoreSaved: scoreSavedForRound,
  });

  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
