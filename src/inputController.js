const KEY_TO_DIRECTION = {
  ArrowUp: "UP",
  ArrowDown: "DOWN",
  ArrowLeft: "LEFT",
  ArrowRight: "RIGHT",
};

const SWIPE_THRESHOLD = 28;

export function createInputController({
  canvas,
  directionButtons,
  onDirection,
  onPauseToggle,
  onRestart,
  onPrimaryAction,
}) {
  let startTouch = null;
  let activeTouchId = null;

  function handleDirection(direction) {
    onDirection(direction);
  }

  function onKeyDown(event) {
    const direction = KEY_TO_DIRECTION[event.key];
    if (direction) {
      event.preventDefault();
      handleDirection(direction);
      return;
    }

    if (event.key === "p" || event.key === "P") {
      event.preventDefault();
      onPauseToggle();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      onRestart();
    }
  }

  function onTouchStart(event) {
    if (activeTouchId !== null) {
      return;
    }

    const [touch] = event.changedTouches;
    if (!touch) {
      return;
    }

    activeTouchId = touch.identifier;
    startTouch = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchMove(event) {
    if (startTouch) {
      event.preventDefault();
    }
  }

  function onTouchEnd(event) {
    if (!startTouch || activeTouchId === null) {
      return;
    }

    const touch = Array.from(event.changedTouches).find((item) => item.identifier === activeTouchId);
    if (!touch) {
      return;
    }

    const dx = touch.clientX - startTouch.x;
    const dy = touch.clientY - startTouch.y;
    startTouch = null;
    activeTouchId = null;

    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
      onPrimaryAction();
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      handleDirection(dx > 0 ? "RIGHT" : "LEFT");
      return;
    }

    handleDirection(dy > 0 ? "DOWN" : "UP");
  }

  function onTouchCancel() {
    startTouch = null;
    activeTouchId = null;
  }

  window.addEventListener("keydown", onKeyDown);
  canvas.addEventListener("touchstart", onTouchStart, { passive: true });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd, { passive: true });
  canvas.addEventListener("touchcancel", onTouchCancel);

  directionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleDirection(button.dataset.dir);
    });
  });

  return {
    destroy() {
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchCancel);
    },
  };
}
