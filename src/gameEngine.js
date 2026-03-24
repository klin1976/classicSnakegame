import { GAME_STATES } from "./stateManager.js";

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

function isOpposite(a, b) {
  return a.x + b.x === 0 && a.y + b.y === 0;
}

function samePoint(a, b) {
  return a.x === b.x && a.y === b.y;
}

function randomFood(gridSize, occupied, rng) {
  const blocked = new Set(occupied.map((point) => `${point.x}:${point.y}`));
  const freeCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x}:${y}`;
      if (!blocked.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return { x: 0, y: 0 };
  }

  const index = Math.floor(rng() * freeCells.length);
  return freeCells[index];
}

function moveIntervalFromScore(score, config) {
  const level = Math.floor(score / config.speedUpEvery);
  const interval = config.baseMoveInterval - level * config.speedUpAmount;
  return Math.max(config.minMoveInterval, interval);
}

export function createGameEngine({
  stateManager,
  rng = Math.random,
  onEat = () => {},
  onGameOver = () => {},
  config = {
    baseMoveInterval: 160,
    minMoveInterval: 75,
    speedUpEvery: 4,
    speedUpAmount: 8,
  },
} = {}) {
  let elapsed = 0;

  function createInitialSnake(gridSize) {
    const mid = Math.floor(gridSize / 2);
    return [
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ];
  }

  function resetRound(nextGameState = GAME_STATES.PLAYING) {
    const current = stateManager.getState();
    const snake = createInitialSnake(current.gridSize);
    const direction = { ...DIRECTIONS.RIGHT };
    const food = randomFood(current.gridSize, snake, rng);

    stateManager.update((draft) => {
      draft.snake = snake;
      draft.food = food;
      draft.direction = direction;
      draft.queuedDirection = direction;
      draft.score = 0;
      draft.moveInterval = config.baseMoveInterval;
      draft.gameState = nextGameState;
    });

    elapsed = 0;
  }

  function setGameOver() {
    stateManager.update((draft) => {
      draft.gameState = GAME_STATES.GAME_OVER;
    });
    onGameOver();
  }

  function queueDirection(directionName) {
    const next = DIRECTIONS[directionName];
    if (!next) {
      return;
    }

    const state = stateManager.getState();
    if (state.gameState !== GAME_STATES.PLAYING) {
      return;
    }

    const reference = state.queuedDirection;
    if (isOpposite(reference, next)) {
      return;
    }

    stateManager.update((draft) => {
      draft.queuedDirection = { ...next };
    });
  }

  function togglePause() {
    const state = stateManager.getState();
    if (state.gameState === GAME_STATES.PLAYING) {
      stateManager.update((draft) => {
        draft.gameState = GAME_STATES.PAUSED;
      });
      return;
    }

    if (state.gameState === GAME_STATES.PAUSED) {
      stateManager.update((draft) => {
        draft.gameState = GAME_STATES.PLAYING;
      });
    }
  }

  function restart() {
    resetRound(GAME_STATES.PLAYING);
  }

  function start() {
    resetRound(GAME_STATES.PLAYING);
  }

  function step() {
    const state = stateManager.getState();
    if (state.gameState !== GAME_STATES.PLAYING) {
      return;
    }

    const nextDirection = state.queuedDirection;
    const head = state.snake[0];
    const nextHead = {
      x: head.x + nextDirection.x,
      y: head.y + nextDirection.y,
    };

    const hitWall =
      nextHead.x < 0 ||
      nextHead.y < 0 ||
      nextHead.x >= state.gridSize ||
      nextHead.y >= state.gridSize;

    if (hitWall) {
      setGameOver();
      return;
    }

    const eating = samePoint(nextHead, state.food);
    const bodyToCheck = eating ? state.snake : state.snake.slice(0, -1);
    const hitSelf = bodyToCheck.some((segment) => samePoint(segment, nextHead));

    if (hitSelf) {
      setGameOver();
      return;
    }

    const nextSnake = [nextHead, ...state.snake];
    if (!eating) {
      nextSnake.pop();
    }

    stateManager.update((draft) => {
      draft.snake = nextSnake;
      draft.direction = { ...nextDirection };
      draft.queuedDirection = { ...nextDirection };

      if (eating) {
        draft.score += 1;
        draft.food = randomFood(draft.gridSize, nextSnake, rng);
        draft.moveInterval = moveIntervalFromScore(draft.score, config);
      }
    });

    if (eating) {
      onEat();
    }
  }

  return {
    start,
    restart,
    step,
    update(deltaMs) {
      const state = stateManager.getState();
      if (state.gameState !== GAME_STATES.PLAYING) {
        elapsed = 0;
        return;
      }

      elapsed += deltaMs;
      while (elapsed >= stateManager.getState().moveInterval) {
        elapsed -= stateManager.getState().moveInterval;
        step();

        if (stateManager.getState().gameState !== GAME_STATES.PLAYING) {
          elapsed = 0;
          break;
        }
      }
    },
    queueDirection,
    togglePause,
  };
}
