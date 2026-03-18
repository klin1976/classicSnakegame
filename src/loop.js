export function createLoop(onTick) {
  let timerId = null;
  let currentMs = null;

  function stop() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function start(ms) {
    if (timerId !== null && currentMs === ms) {
      return;
    }
    stop();
    currentMs = ms;
    timerId = window.setInterval(onTick, ms);
  }

  function restart(ms) {
    stop();
    start(ms);
  }

  function isRunning() {
    return timerId !== null;
  }

  return {
    start,
    stop,
    restart,
    isRunning,
  };
}
