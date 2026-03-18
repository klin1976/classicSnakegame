# Classic Snake Game

A minimal, modular Snake game built with plain HTML/CSS/JavaScript.

## Gameplay

- Move the snake on a 20x20 grid.
- Eat red food to grow and gain score.
- Avoid walls, your own body, and obstacles (when obstacle mode is enabled).
- Use restart to reset score, speed, and direction.

## Controls

- Keyboard: `Arrow keys` or `W/A/S/D`
- On-screen: `Up / Left / Down / Right` buttons
- `Start`: begin game
- `Pause/Resume`: pause and continue
- `Restart`: reset game immediately
- `Demo: ON/OFF`: AI auto-play (BFS)

## Features

- Difficulty scaling by score
- High score persistence via `localStorage`
- Special food mode (slowdown effect)
- Wrap walls mode
- Obstacle mode
- Demo mode (BFS pathfinding)
- Core logic tests that run without DOM

## Development

### Run locally

```bash
cd F:\Codex\classicSnakegame
python -m http.server 8000
```

Open: `http://localhost:8000`

### Run tests

```bash
node --test src/snakeCore.test.js
```

## GitHub Pages

This repo includes a Pages workflow that deploys static files from the root.

### One-time setup

1. Push this repository to GitHub.
2. In repository settings, open **Pages**.
3. Ensure source is **GitHub Actions**.

After that, every push to `main` deploys automatically.

## Screenshots

Start screen:

![Start](./assets/screenshots/start.svg)

In-game:

![Running](./assets/screenshots/running.svg)

Game over:

![Game Over](./assets/screenshots/gameover.svg)
