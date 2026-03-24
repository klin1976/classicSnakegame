function createTone(context, { type, frequency, durationMs, volume, slideTo } = {}) {
  const now = context.currentTime;
  const gain = context.createGain();
  const oscillator = context.createOscillator();

  oscillator.type = type ?? "sine";
  oscillator.frequency.setValueAtTime(frequency ?? 440, now);

  if (typeof slideTo === "number") {
    oscillator.frequency.linearRampToValueAtTime(slideTo, now + durationMs / 1000);
  }

  gain.gain.setValueAtTime(volume ?? 0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + durationMs / 1000);
}

export function createSoundEffects() {
  const AudioContextRef = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextRef) {
    return {
      unlock() {},
      playEat() {},
      playGameOver() {},
    };
  }

  const context = new AudioContextRef();

  return {
    unlock() {
      if (context.state === "suspended") {
        context.resume().catch(() => {});
      }
    },

    playEat() {
      createTone(context, {
        type: "triangle",
        frequency: 880,
        durationMs: 80,
        volume: 0.04,
        slideTo: 1040,
      });
    },

    playGameOver() {
      createTone(context, {
        type: "sawtooth",
        frequency: 280,
        durationMs: 240,
        volume: 0.06,
        slideTo: 140,
      });
    },
  };
}
