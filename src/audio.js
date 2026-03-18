let audioContext = null;

function getContext() {
  if (!audioContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      return null;
    }
    audioContext = new Ctx();
  }
  return audioContext;
}

function playTone(frequency, durationMs, type = "square", gainValue = 0.04) {
  try {
    const ctx = getContext();
    if (!ctx) {
      return;
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = gainValue;

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    oscillator.start(now);
    oscillator.stop(now + durationMs / 1000);
  } catch {
    // Audio failure should never break gameplay.
  }
}

export function playEat() {
  playTone(540, 70, "square", 0.03);
}

export function playGameOver() {
  playTone(170, 220, "sawtooth", 0.05);
}
