import test from "node:test";
import assert from "node:assert/strict";
import {
  DIRECTIONS,
  createInitialState,
  setDirection,
  tickWithOptions,
} from "./snakeCore.js";

function noSpawnRandom() {
  return 0.99;
}

test("hits wall when wrap mode is off", () => {
  let state = createInitialState({ gridWidth: 5, gridHeight: 5, speedMs: 100 }, noSpawnRandom);
  state = {
    ...state,
    snake: [{ x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }],
    direction: DIRECTIONS.RIGHT,
    pendingDirection: DIRECTIONS.RIGHT,
  };

  const next = tickWithOptions(
    state,
    {
      getSpeedMs: () => 100,
      wrapWalls: false,
      specialFoodEnabled: false,
      obstacleModeEnabled: false,
    },
    noSpawnRandom
  );

  assert.equal(next.isGameOver, true);
});

test("wraps around when wrap mode is on", () => {
  let state = createInitialState({ gridWidth: 5, gridHeight: 5, speedMs: 100 }, noSpawnRandom);
  state = {
    ...state,
    snake: [{ x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }],
    direction: DIRECTIONS.RIGHT,
    pendingDirection: DIRECTIONS.RIGHT,
  };

  const next = tickWithOptions(
    state,
    {
      getSpeedMs: () => 100,
      wrapWalls: true,
      specialFoodEnabled: false,
      obstacleModeEnabled: false,
    },
    noSpawnRandom
  );

  assert.equal(next.isGameOver, false);
  assert.deepEqual(next.snake[0], { x: 0, y: 2 });
});

test("eating special food applies slowdown and counts specialEaten", () => {
  let state = createInitialState({ gridWidth: 8, gridHeight: 8, speedMs: 100 }, noSpawnRandom);
  state = {
    ...state,
    snake: [{ x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 }],
    direction: DIRECTIONS.RIGHT,
    pendingDirection: DIRECTIONS.RIGHT,
    food: { x: 7, y: 7 },
    specialFood: { x: 4, y: 3 },
    score: 5,
  };

  const next = tickWithOptions(
    state,
    {
      getSpeedMs: () => 80,
      wrapWalls: false,
      specialFoodEnabled: true,
      obstacleModeEnabled: false,
    },
    noSpawnRandom
  );

  assert.equal(next.specialEaten, state.specialEaten + 1);
  assert.equal(next.slowdownTicks > 0, true);
  assert.equal(next.speedMs > 80, true);
});

test("direction input is ignored when paused", () => {
  const state = createInitialState({ gridWidth: 8, gridHeight: 8, speedMs: 100 }, noSpawnRandom);
  const pausedState = { ...state, isPaused: true };

  const next = setDirection(pausedState, "UP");
  assert.deepEqual(next.pendingDirection, pausedState.pendingDirection);
});

test("obstacle mode causes collision with obstacle", () => {
  let state = createInitialState({ gridWidth: 8, gridHeight: 8, speedMs: 100 }, noSpawnRandom);
  state = {
    ...state,
    snake: [{ x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 }],
    direction: DIRECTIONS.RIGHT,
    pendingDirection: DIRECTIONS.RIGHT,
    obstacles: [{ x: 4, y: 3 }],
  };

  const next = tickWithOptions(
    state,
    {
      getSpeedMs: () => 100,
      wrapWalls: false,
      specialFoodEnabled: false,
      obstacleModeEnabled: true,
    },
    noSpawnRandom
  );

  assert.equal(next.isGameOver, true);
});

test("obstacles are ignored when obstacle mode is off", () => {
  let state = createInitialState({ gridWidth: 8, gridHeight: 8, speedMs: 100 }, noSpawnRandom);
  state = {
    ...state,
    snake: [{ x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 }],
    direction: DIRECTIONS.RIGHT,
    pendingDirection: DIRECTIONS.RIGHT,
    obstacles: [{ x: 4, y: 3 }],
    food: { x: 7, y: 7 },
  };

  const next = tickWithOptions(
    state,
    {
      getSpeedMs: () => 100,
      wrapWalls: false,
      specialFoodEnabled: false,
      obstacleModeEnabled: false,
    },
    noSpawnRandom
  );

  assert.equal(next.isGameOver, false);
  assert.deepEqual(next.snake[0], { x: 4, y: 3 });
});
