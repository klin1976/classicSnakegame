const HIGH_SCORE_KEY = "modernSnake.highScore";

export const GAME_STATES = {
  START: "start",
  PLAYING: "playing",
  PAUSED: "paused",
  GAME_OVER: "gameOver",
  LEADERBOARD: "leaderboard",
};

function loadHighScore(storageKey) {
  const raw = window.localStorage.getItem(storageKey);
  const parsed = Number.parseInt(raw ?? "0", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clonePoint(point) {
  return { x: point.x, y: point.y };
}

function cloneState(state) {
  return {
    ...state,
    snake: state.snake.map(clonePoint),
    food: clonePoint(state.food),
    direction: clonePoint(state.direction),
    queuedDirection: clonePoint(state.queuedDirection),
  };
}

export function createStateManager({
  storageKey = HIGH_SCORE_KEY,
  gridSize = 20,
  initialMoveInterval = 160,
} = {}) {
  let state = {
    gridSize,
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ],
    food: { x: 14, y: 10 },
    direction: { x: 1, y: 0 },
    queuedDirection: { x: 1, y: 0 },
    score: 0,
    highScore: loadHighScore(storageKey),
    moveInterval: initialMoveInterval,
    gameState: GAME_STATES.START,
  };

  function commit(nextState) {
    if (nextState.score > nextState.highScore) {
      nextState.highScore = nextState.score;
    }

    if (nextState.highScore !== state.highScore) {
      window.localStorage.setItem(storageKey, String(nextState.highScore));
    }

    state = nextState;
  }

  return {
    getState() {
      return state;
    },

    update(updater) {
      const draft = cloneState(state);
      updater(draft);
      commit(draft);
    },

    setState(nextState) {
      commit(cloneState(nextState));
    },
  };
}
