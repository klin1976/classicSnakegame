import {
  createInitialState,
  generateObstacles,
  placeFoodAvoiding,
  setDirection,
  tickWithOptions,
} from "./snakeCore.js";
import {
  GRID_SIZE,
  INITIAL_SPEED_MS,
  OBSTACLE_COUNT,
  SPECIAL_SPAWN_CHANCE,
  getSpeedForScore,
} from "./config.js";
import { getHighScore, setHighScore } from "./storage.js";
import { playEat, playGameOver } from "./audio.js";
import { APP_STATE } from "./stateMachine.js";
import { createLoop } from "./loop.js";
import { createRenderer } from "./render.js";
import { bindInputHandlers } from "./input.js";
import { getAIDirection } from "./ai.js";
import { getInitialLanguage, pickSupportedLanguage, setLanguagePreference } from "./i18n.js";

const elements = {
  boardEl: document.getElementById("board"),
  scoreEl: document.getElementById("score"),
  highScoreEl: document.getElementById("high-score"),
  statusEl: document.getElementById("status"),
  titleEl: document.getElementById("title-text"),
  startMessageEl: document.getElementById("start-message"),
  scoreLabelEl: document.getElementById("score-label"),
  highLabelEl: document.getElementById("high-label"),
  wrapLabelEl: document.getElementById("wrap-label"),
  specialLabelEl: document.getElementById("special-label"),
  obstacleLabelEl: document.getElementById("obstacle-label"),
  upBtn: document.getElementById("btn-up"),
  leftBtn: document.getElementById("btn-left"),
  downBtn: document.getElementById("btn-down"),
  rightBtn: document.getElementById("btn-right"),
  hintEl: document.getElementById("hint-text"),
  languageLabelEl: document.getElementById("language-label"),
  languageSelectEl: document.getElementById("language-select"),
  pauseBtn: document.getElementById("pause-btn"),
  restartBtn: document.getElementById("restart-btn"),
  startBtn: document.getElementById("start-btn"),
  startScreenEl: document.getElementById("start-screen"),
  controlsEl: document.querySelector(".controls"),
  demoBtn: document.getElementById("demo-btn"),
  wrapToggleEl: document.getElementById("wrap-mode"),
  specialToggleEl: document.getElementById("special-food-mode"),
  obstacleToggleEl: document.getElementById("obstacle-mode"),
};
const searchParams = new URLSearchParams(window.location.search);
const scenePreset = searchParams.get("scene");
const staticPreview = searchParams.get("static") === "1";
const queryLanguage = searchParams.get("lang") || "";

let state = createInitialState({
  gridWidth: GRID_SIZE,
  gridHeight: GRID_SIZE,
  speedMs: INITIAL_SPEED_MS,
});
let appState = APP_STATE.START;
let highScore = getHighScore();
let language = getInitialLanguage(queryLanguage);
if (queryLanguage) {
  setLanguagePreference(language);
}
const modeFlags = {
  wrapWalls: false,
  specialFood: false,
  obstacleMode: false,
  demoMode: false,
};

const renderer = createRenderer(elements);
const loop = createLoop(gameLoop);
let loopSpeedMs = null;

function applyScenePreset() {
  if (!scenePreset) {
    return;
  }

  if (scenePreset === "running") {
    modeFlags.specialFood = true;
    modeFlags.obstacleMode = true;
    state = {
      ...createInitialState({
        gridWidth: GRID_SIZE,
        gridHeight: GRID_SIZE,
        speedMs: getSpeedForScore(10),
      }),
      snake: [
        { x: 11, y: 10 },
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 8, y: 9 },
      ],
      direction: { x: 1, y: 0 },
      pendingDirection: { x: 1, y: 0 },
      food: { x: 14, y: 10 },
      specialFood: { x: 6, y: 12 },
      obstacles: [{ x: 5, y: 8 }, { x: 5, y: 9 }, { x: 5, y: 10 }, { x: 5, y: 11 }],
      score: 10,
    };
    appState = APP_STATE.RUNNING;
    highScore = Math.max(highScore, 10);
    return;
  }

  if (scenePreset === "gameover") {
    modeFlags.obstacleMode = true;
    state = {
      ...createInitialState({
        gridWidth: GRID_SIZE,
        gridHeight: GRID_SIZE,
        speedMs: getSpeedForScore(6),
      }),
      snake: [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
        { x: 3, y: 4 },
      ],
      food: { x: 12, y: 12 },
      obstacles: [{ x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 }],
      score: 6,
      isGameOver: true,
    };
    appState = APP_STATE.GAMEOVER;
    highScore = Math.max(highScore, 12);
  }
}

function updateHighScore(score) {
  if (score <= highScore) {
    return;
  }
  highScore = score;
  setHighScore(highScore);
}

function resetGame() {
  const nextState = createInitialState({
    gridWidth: GRID_SIZE,
    gridHeight: GRID_SIZE,
    speedMs: INITIAL_SPEED_MS,
  });

  const obstacles = modeFlags.obstacleMode
    ? generateObstacles(
        {
          gridWidth: GRID_SIZE,
          gridHeight: GRID_SIZE,
          snake: nextState.snake,
          count: OBSTACLE_COUNT,
        },
        Math.random
      )
    : [];

  const food = placeFoodAvoiding(
    nextState.snake,
    obstacles,
    GRID_SIZE,
    GRID_SIZE,
    Math.random
  );

  state = {
    ...nextState,
    obstacles,
    food,
  };
}

function applyAIDirectionIfNeeded() {
  if (!modeFlags.demoMode || appState !== APP_STATE.RUNNING) {
    return;
  }
  const directionName = getAIDirection(
    state,
    modeFlags.wrapWalls,
    modeFlags.obstacleMode ? state.obstacles : []
  );
  if (directionName) {
    state = setDirection(state, directionName);
  }
}

function syncLoop() {
  if (staticPreview) {
    loop.stop();
    loopSpeedMs = null;
    return;
  }

  if (appState !== APP_STATE.RUNNING || state.isGameOver) {
    loop.stop();
    loopSpeedMs = null;
    return;
  }

  if (!loop.isRunning()) {
    loop.start(state.speedMs);
    loopSpeedMs = state.speedMs;
    return;
  }

  if (loopSpeedMs !== state.speedMs) {
    loop.restart(state.speedMs);
    loopSpeedMs = state.speedMs;
  }
}

function render() {
  document.documentElement.lang = language;
  renderer.render({
    state,
    appState,
    highScore,
    modeFlags,
    language,
  });
}

function transitionTo(nextState) {
  appState = nextState;
  render();
  syncLoop();
}

function gameLoop() {
  if (appState !== APP_STATE.RUNNING) {
    return;
  }

  applyAIDirectionIfNeeded();
  const prevState = state;
  state = tickWithOptions(
    state,
    {
      getSpeedMs: getSpeedForScore,
      wrapWalls: modeFlags.wrapWalls,
      specialFoodEnabled: modeFlags.specialFood,
      obstacleModeEnabled: modeFlags.obstacleMode,
      specialSpawnChance: SPECIAL_SPAWN_CHANCE,
    },
    Math.random
  );

  if (state.foodsEaten > prevState.foodsEaten) {
    playEat();
    updateHighScore(state.score);
  }
  if (state.specialEaten > prevState.specialEaten) {
    playEat();
  }

  if (state.isGameOver) {
    playGameOver();
    updateHighScore(state.score);
    transitionTo(APP_STATE.GAMEOVER);
    return;
  }

  render();
  syncLoop();
}

function handleDirection(directionName) {
  if (appState !== APP_STATE.RUNNING) {
    return;
  }
  state = setDirection(state, directionName);
}

function handlePauseToggle() {
  if (appState === APP_STATE.RUNNING) {
    transitionTo(APP_STATE.PAUSED);
    return;
  }
  if (appState === APP_STATE.PAUSED) {
    transitionTo(APP_STATE.RUNNING);
  }
}

function handleRestart() {
  resetGame();
  transitionTo(APP_STATE.RUNNING);
}

function handleStart() {
  resetGame();
  transitionTo(APP_STATE.RUNNING);
}

function handleDemoToggle() {
  modeFlags.demoMode = !modeFlags.demoMode;
  render();
}

function handleWrapToggle(checked) {
  modeFlags.wrapWalls = checked;
  render();
}

function handleSpecialToggle(checked) {
  modeFlags.specialFood = checked;
  if (!checked) {
    state = {
      ...state,
      specialFood: null,
      slowdownTicks: 0,
      speedMs: getSpeedForScore(state.score),
    };
  }
  render();
  syncLoop();
}

function handleObstacleToggle(checked) {
  modeFlags.obstacleMode = checked;
  resetGame();
  if (appState !== APP_STATE.START) {
    transitionTo(APP_STATE.RUNNING);
    return;
  }
  render();
}

function handleLanguageChange(nextLanguage) {
  language = pickSupportedLanguage(nextLanguage);
  setLanguagePreference(language);
  const url = new URL(window.location.href);
  url.searchParams.set("lang", language);
  window.history.replaceState({}, "", url);
  render();
}

bindInputHandlers({
  ...elements,
  onDirection: handleDirection,
  onPause: handlePauseToggle,
  onRestart: handleRestart,
  onStart: handleStart,
  onToggleDemo: handleDemoToggle,
  onToggleWrap: handleWrapToggle,
  onToggleSpecial: handleSpecialToggle,
  onToggleObstacle: handleObstacleToggle,
});

elements.languageSelectEl.addEventListener("change", (event) => {
  handleLanguageChange(event.target.value);
});

applyScenePreset();
render();
