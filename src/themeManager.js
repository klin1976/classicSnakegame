const THEME_KEY = "modernSnake.theme";

const THEMES = {
  dark: {
    name: "dark",
    palette: {
      boardBg: "#0b1425",
      boardLine: "rgba(148, 163, 184, 0.08)",
      snakeHead: "#6ee7b7",
      snakeBody: "#34d399",
      foodCore: "#fb7185",
      foodGlow: "rgba(248, 113, 113, 0.96)",
    },
  },
  neon: {
    name: "neon",
    palette: {
      boardBg: "#060b17",
      boardLine: "rgba(71, 206, 255, 0.16)",
      snakeHead: "#6fffe9",
      snakeBody: "#22d3ee",
      foodCore: "#f43fbe",
      foodGlow: "rgba(244, 63, 190, 0.95)",
    },
  },
  retro: {
    name: "retro",
    palette: {
      boardBg: "#202613",
      boardLine: "rgba(190, 170, 106, 0.14)",
      snakeHead: "#a3e635",
      snakeBody: "#65a30d",
      foodCore: "#f97316",
      foodGlow: "rgba(249, 115, 22, 0.95)",
    },
  },
};

export function createThemeManager({ storageKey = THEME_KEY } = {}) {
  function resolveThemeName(value) {
    return Object.hasOwn(THEMES, value) ? value : "dark";
  }

  return {
    getAvailableThemes() {
      return Object.keys(THEMES);
    },

    getInitialTheme() {
      const stored = window.localStorage.getItem(storageKey);
      return resolveThemeName(stored);
    },

    getPalette(themeName) {
      return THEMES[resolveThemeName(themeName)].palette;
    },

    applyTheme(themeName) {
      const resolved = resolveThemeName(themeName);
      window.localStorage.setItem(storageKey, resolved);
      document.body.dataset.theme = resolved;
      return resolved;
    },
  };
}
