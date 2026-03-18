const KEY_TO_DIRECTION = {
  ArrowUp: "UP",
  ArrowDown: "DOWN",
  ArrowLeft: "LEFT",
  ArrowRight: "RIGHT",
  w: "UP",
  W: "UP",
  s: "DOWN",
  S: "DOWN",
  a: "LEFT",
  A: "LEFT",
  d: "RIGHT",
  D: "RIGHT",
};

export function bindInputHandlers({
  controlsEl,
  pauseBtn,
  restartBtn,
  startBtn,
  demoBtn,
  wrapToggleEl,
  specialToggleEl,
  obstacleToggleEl,
  onDirection,
  onPause,
  onRestart,
  onStart,
  onToggleDemo,
  onToggleWrap,
  onToggleSpecial,
  onToggleObstacle,
}) {
  const keyHandler = (event) => {
    const directionName = KEY_TO_DIRECTION[event.key];
    if (!directionName) {
      return;
    }
    event.preventDefault();
    onDirection(directionName);
  };

  const controlsHandler = (event) => {
    const button = event.target.closest("button[data-direction]");
    if (!button) {
      return;
    }
    event.preventDefault();
    onDirection(button.dataset.direction);
  };

  const pauseHandler = (event) => {
    event.preventDefault();
    onPause();
  };

  const restartHandler = (event) => {
    event.preventDefault();
    onRestart();
  };

  const startHandler = (event) => {
    event.preventDefault();
    onStart();
  };

  const demoHandler = (event) => {
    event.preventDefault();
    onToggleDemo();
  };

  const wrapHandler = () => onToggleWrap(wrapToggleEl.checked);
  const specialHandler = () => onToggleSpecial(specialToggleEl.checked);
  const obstacleHandler = () => onToggleObstacle(obstacleToggleEl.checked);

  const touchMoveHandler = (event) => {
    if (event.target.closest(".controls") || event.target.closest(".board")) {
      event.preventDefault();
    }
  };

  window.addEventListener("keydown", keyHandler);
  controlsEl.addEventListener("pointerdown", controlsHandler);
  pauseBtn.addEventListener("pointerdown", pauseHandler);
  restartBtn.addEventListener("pointerdown", restartHandler);
  startBtn.addEventListener("pointerdown", startHandler);
  demoBtn.addEventListener("pointerdown", demoHandler);
  wrapToggleEl.addEventListener("change", wrapHandler);
  specialToggleEl.addEventListener("change", specialHandler);
  obstacleToggleEl.addEventListener("change", obstacleHandler);
  document.addEventListener("touchmove", touchMoveHandler, { passive: false });

  return () => {
    window.removeEventListener("keydown", keyHandler);
    controlsEl.removeEventListener("pointerdown", controlsHandler);
    pauseBtn.removeEventListener("pointerdown", pauseHandler);
    restartBtn.removeEventListener("pointerdown", restartHandler);
    startBtn.removeEventListener("pointerdown", startHandler);
    demoBtn.removeEventListener("pointerdown", demoHandler);
    wrapToggleEl.removeEventListener("change", wrapHandler);
    specialToggleEl.removeEventListener("change", specialHandler);
    obstacleToggleEl.removeEventListener("change", obstacleHandler);
    document.removeEventListener("touchmove", touchMoveHandler);
  };
}
