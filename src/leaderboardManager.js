const LEADERBOARD_KEY = "modernSnake.leaderboard";
const LAST_NAME_KEY = "modernSnake.lastPlayerName";
const MAX_ENTRIES = 10;
const MAX_NAME_LENGTH = 10;

function normalizeName(name) {
  const trimmed = String(name ?? "").trim();
  const clipped = trimmed.slice(0, MAX_NAME_LENGTH);
  return clipped || "PLAYER";
}

function normalizeScore(value) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizeEntries(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => ({
      name: normalizeName(entry?.name),
      score: normalizeScore(entry?.score),
      createdAt: Number.isFinite(entry?.createdAt) ? entry.createdAt : Date.now(),
    }))
    .sort((a, b) => b.score - a.score || a.createdAt - b.createdAt)
    .slice(0, MAX_ENTRIES);
}

export function createLeaderboardManager({
  storageKey = LEADERBOARD_KEY,
  lastNameKey = LAST_NAME_KEY,
} = {}) {
  function loadEntries() {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return sanitizeEntries(JSON.parse(raw ?? "[]"));
    } catch {
      return [];
    }
  }

  function saveEntries(entries) {
    window.localStorage.setItem(storageKey, JSON.stringify(entries));
  }

  return {
    getEntries() {
      return loadEntries();
    },

    getLastPlayerName() {
      const raw = window.localStorage.getItem(lastNameKey);
      return normalizeName(raw || "PLAYER");
    },

    saveScore(name, score) {
      const entry = {
        name: normalizeName(name),
        score: normalizeScore(score),
        createdAt: Date.now(),
      };

      const next = sanitizeEntries([...loadEntries(), entry]);
      saveEntries(next);
      window.localStorage.setItem(lastNameKey, entry.name);
      return next;
    },

    normalizeName,
    maxNameLength: MAX_NAME_LENGTH,
  };
}
