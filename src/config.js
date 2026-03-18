export const GRID_SIZE = 20;
export const INITIAL_SPEED_MS = 100;
export const SPECIAL_SPAWN_CHANCE = 0.08;
export const OBSTACLE_COUNT = 16;

export const SPEED_LEVELS = [
  { score: 0, ms: 100 },
  { score: 8, ms: 80 },
  { score: 16, ms: 60 },
];

export function getSpeedForScore(score) {
  let ms = INITIAL_SPEED_MS;
  for (const level of SPEED_LEVELS) {
    if (score >= level.score) {
      ms = level.ms;
    }
  }
  return ms;
}
