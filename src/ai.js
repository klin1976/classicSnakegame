import { DIRECTIONS } from "./snakeCore.js";

const DIRECTION_ORDER = ["UP", "RIGHT", "DOWN", "LEFT"];

function toKey(point) {
  return `${point.x},${point.y}`;
}

function normalize(point, gridWidth, gridHeight, wrapWalls) {
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

function isOutOfBounds(point, gridWidth, gridHeight) {
  return (
    point.x < 0 ||
    point.y < 0 ||
    point.x >= gridWidth ||
    point.y >= gridHeight
  );
}

function isBlocked(point, blockedSet) {
  return blockedSet.has(toKey(point));
}

function getNeighbors(point, gridWidth, gridHeight, wrapWalls) {
  const neighbors = [];
  for (const directionName of DIRECTION_ORDER) {
    const direction = DIRECTIONS[directionName];
    const raw = { x: point.x + direction.x, y: point.y + direction.y };
    if (!wrapWalls && isOutOfBounds(raw, gridWidth, gridHeight)) {
      continue;
    }
    const next = normalize(raw, gridWidth, gridHeight, wrapWalls);
    neighbors.push({ directionName, point: next });
  }
  return neighbors;
}

function reconstructFirstStep(parentMap, startKey, targetKey) {
  let current = targetKey;
  let prev = parentMap.get(current);
  while (prev && prev.parentKey !== startKey) {
    current = prev.parentKey;
    prev = parentMap.get(current);
  }
  return prev ? prev.directionName : null;
}

function findPathDirection(state, wrapWalls, obstacles = []) {
  const target = state.food;
  if (!target) {
    return null;
  }

  const head = state.snake[0];
  const startKey = toKey(head);
  const targetKey = toKey(target);
  const blocked = new Set(state.snake.slice(0, -1).map(toKey));
  for (const obstacle of obstacles) {
    blocked.add(toKey(obstacle));
  }
  blocked.delete(startKey);

  const queue = [head];
  const visited = new Set([startKey]);
  const parentMap = new Map();

  while (queue.length > 0) {
    const current = queue.shift();
    const currentKey = toKey(current);
    if (currentKey === targetKey) {
      return reconstructFirstStep(parentMap, startKey, targetKey);
    }

    for (const neighbor of getNeighbors(
      current,
      state.gridWidth,
      state.gridHeight,
      wrapWalls
    )) {
      const nextKey = toKey(neighbor.point);
      if (visited.has(nextKey) || isBlocked(neighbor.point, blocked)) {
        continue;
      }
      visited.add(nextKey);
      parentMap.set(nextKey, {
        parentKey: currentKey,
        directionName: neighbor.directionName,
      });
      queue.push(neighbor.point);
    }
  }

  return null;
}

function findSafeDirection(state, wrapWalls, obstacles = []) {
  const head = state.snake[0];
  const blocked = new Set(state.snake.slice(0, -1).map(toKey));
  for (const obstacle of obstacles) {
    blocked.add(toKey(obstacle));
  }
  for (const directionName of DIRECTION_ORDER) {
    const direction = DIRECTIONS[directionName];
    const raw = { x: head.x + direction.x, y: head.y + direction.y };
    if (!wrapWalls && isOutOfBounds(raw, state.gridWidth, state.gridHeight)) {
      continue;
    }
    const next = normalize(raw, state.gridWidth, state.gridHeight, wrapWalls);
    if (!blocked.has(toKey(next))) {
      return directionName;
    }
  }
  return null;
}

export function getAIDirection(state, wrapWalls, obstacles = []) {
  return (
    findPathDirection(state, wrapWalls, obstacles) ||
    findSafeDirection(state, wrapWalls, obstacles)
  );
}
