export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const START_LENGTH = 3;
const DEFAULT_SPEED_MS = 100;
const SPECIAL_SLOWDOWN_MS = 35;
const SPECIAL_SLOWDOWN_TICKS = 12;

function cloneSnake(snake) {
  return snake.map((part) => ({ x: part.x, y: part.y }));
}

function samePoint(a, b) {
  return a.x === b.x && a.y === b.y;
}

function isOppositeDirection(current, next) {
  return (
    current.x + next.x === 0 &&
    current.y + next.y === 0
  );
}

export function placeFood(snake, gridWidth, gridHeight, random = Math.random) {
  return placeFoodAvoiding(
    snake,
    [],
    gridWidth,
    gridHeight,
    random
  );
}

export function placeFoodAvoiding(
  snake,
  blockedCells,
  gridWidth,
  gridHeight,
  random = Math.random
) {
  const occupied = new Set(snake.map((part) => `${part.x},${part.y}`));
  for (const blocked of blockedCells) {
    occupied.add(`${blocked.x},${blocked.y}`);
  }
  const freeCells = [];

  for (let y = 0; y < gridHeight; y += 1) {
    for (let x = 0; x < gridWidth; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const index = Math.floor(random() * freeCells.length);
  return freeCells[index];
}

export function generateObstacles(
  { gridWidth, gridHeight, snake, count = 0, blockedCells = [] },
  random = Math.random
) {
  const occupied = new Set(snake.map((part) => `${part.x},${part.y}`));
  for (const blocked of blockedCells) {
    occupied.add(`${blocked.x},${blocked.y}`);
  }

  const freeCells = [];
  for (let y = 0; y < gridHeight; y += 1) {
    for (let x = 0; x < gridWidth; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  const obstacles = [];
  const target = Math.max(0, Math.min(count, freeCells.length));
  for (let i = 0; i < target; i += 1) {
    const index = Math.floor(random() * freeCells.length);
    const picked = freeCells[index];
    obstacles.push(picked);
    freeCells.splice(index, 1);
  }
  return obstacles;
}

function normalizePosition(point, gridWidth, gridHeight, wrapWalls) {
  if (!wrapWalls) {
    return point;
  }
  let x = point.x;
  let y = point.y;
  if (x < 0) {
    x = gridWidth - 1;
  } else if (x >= gridWidth) {
    x = 0;
  }
  if (y < 0) {
    y = gridHeight - 1;
  } else if (y >= gridHeight) {
    y = 0;
  }
  return { x, y };
}

export function createInitialState(
  {
    gridWidth = 20,
    gridHeight = 20,
    speedMs = DEFAULT_SPEED_MS,
    obstacles = [],
  } = {},
  random = Math.random
) {
  const startX = Math.floor(gridWidth / 2);
  const startY = Math.floor(gridHeight / 2);
  const snake = [];

  for (let i = 0; i < START_LENGTH; i += 1) {
    snake.push({ x: startX - i, y: startY });
  }

  const obstacleList = obstacles.map((point) => ({ x: point.x, y: point.y }));

  return {
    gridWidth,
    gridHeight,
    snake,
    direction: DIRECTIONS.RIGHT,
    pendingDirection: DIRECTIONS.RIGHT,
    food: placeFoodAvoiding(snake, obstacleList, gridWidth, gridHeight, random),
    specialFood: null,
    obstacles: obstacleList,
    score: 0,
    speedMs,
    slowdownTicks: 0,
    foodsEaten: 0,
    specialEaten: 0,
    isGameOver: false,
    isPaused: false,
    canTurn: true,
  };
}

export function setDirection(state, directionName) {
  const nextDirection = DIRECTIONS[directionName];
  if (!nextDirection || state.isGameOver || state.isPaused || !state.canTurn) {
    return state;
  }

  const current = state.direction;
  if (isOppositeDirection(current, nextDirection) && state.snake.length > 1) {
    return state;
  }

  return {
    ...state,
    pendingDirection: nextDirection,
    canTurn: false,
  };
}

export function togglePause(state) {
  if (state.isGameOver) {
    return state;
  }

  return {
    ...state,
    isPaused: !state.isPaused,
  };
}

export function tick(state, random = Math.random, getSpeedMs = null) {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const options = {
    getSpeedMs,
    wrapWalls: false,
    specialFoodEnabled: false,
    obstacleModeEnabled: false,
    specialSpawnChance: 0.08,
  };
  return tickWithOptions(state, options, random);
}

export function tickWithOptions(state, options, random = Math.random) {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const {
    getSpeedMs,
    wrapWalls,
    specialFoodEnabled,
    obstacleModeEnabled,
    specialSpawnChance = 0.08,
  } = options;
  const activeObstacles = obstacleModeEnabled ? state.obstacles || [] : [];

  const direction = state.pendingDirection;
  const head = state.snake[0];
  const rawHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };
  const nextHead = normalizePosition(
    rawHead,
    state.gridWidth,
    state.gridHeight,
    wrapWalls
  );

  const hitsWall =
    !wrapWalls &&
    (rawHead.x < 0 ||
      rawHead.x >= state.gridWidth ||
      rawHead.y < 0 ||
      rawHead.y >= state.gridHeight);

  if (hitsWall) {
    return {
      ...state,
      direction,
      canTurn: true,
      isGameOver: true,
      isPaused: false,
    };
  }

  const hitsObstacle = activeObstacles.some((part) => samePoint(part, nextHead));
  if (hitsObstacle) {
    return {
      ...state,
      direction,
      canTurn: true,
      isGameOver: true,
      isPaused: false,
    };
  }

  const willGrow = state.food && samePoint(nextHead, state.food);
  const ateSpecial = state.specialFood && samePoint(nextHead, state.specialFood);
  const collisionBody = willGrow ? state.snake : state.snake.slice(0, -1);
  const hitsSelf = collisionBody.some((part) => samePoint(part, nextHead));

  if (hitsSelf) {
    return {
      ...state,
      direction,
      canTurn: true,
      isGameOver: true,
      isPaused: false,
    };
  }

  const nextSnake = [nextHead, ...cloneSnake(state.snake)];
  if (!willGrow) {
    nextSnake.pop();
  }

  const nextScore = state.score + (willGrow ? 1 : 0);
  const baseSpeedMs = getSpeedMs ? getSpeedMs(nextScore) : state.speedMs;
  let slowdownTicks = state.slowdownTicks > 0 ? state.slowdownTicks - 1 : 0;
  if (ateSpecial) {
    slowdownTicks = SPECIAL_SLOWDOWN_TICKS;
  }
  const nextSpeedMs = baseSpeedMs + (slowdownTicks > 0 ? SPECIAL_SLOWDOWN_MS : 0);

  let food = state.food;
  if (willGrow) {
    const blocked = state.specialFood ? [state.specialFood] : [];
    food = placeFoodAvoiding(
      nextSnake,
      [...blocked, ...activeObstacles],
      state.gridWidth,
      state.gridHeight,
      random
    );
  }

  let specialFood = state.specialFood;
  if (ateSpecial) {
    specialFood = null;
  }
  if (specialFood && food && samePoint(specialFood, food)) {
    specialFood = null;
  }
  if (
    specialFoodEnabled &&
    !specialFood &&
    food &&
    random() < specialSpawnChance
  ) {
    specialFood = placeFoodAvoiding(
      nextSnake,
      [...activeObstacles, food],
      state.gridWidth,
      state.gridHeight,
      random
    );
  }
  if (!specialFoodEnabled) {
    specialFood = null;
  }

  return {
    ...state,
    direction,
    snake: nextSnake,
    food,
    specialFood,
    score: nextScore,
    speedMs: nextSpeedMs,
    slowdownTicks,
    foodsEaten: state.foodsEaten + (willGrow ? 1 : 0),
    specialEaten: state.specialEaten + (ateSpecial ? 1 : 0),
    canTurn: true,
    isGameOver: food === null || state.isGameOver,
  };
}
