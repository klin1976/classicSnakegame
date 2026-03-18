const HIGH_SCORE_KEY = "classic-snake-high-score";

export function getHighScore() {
  try {
    const raw = window.localStorage.getItem(HIGH_SCORE_KEY);
    if (!raw) {
      return 0;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
  } catch {
    return 0;
  }
}

export function setHighScore(score) {
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // Ignore storage errors and keep gameplay unaffected.
  }
}
