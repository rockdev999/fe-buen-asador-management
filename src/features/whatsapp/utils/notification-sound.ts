/**
 * Aviso sonoro de pedido nuevo, generado con Web Audio (sin archivo de audio).
 *
 * El navegador bloquea el audio hasta que el usuario interactúa con la página.
 * `unlockNotificationSound` se registra al primer clic/tecla y deja el
 * AudioContext listo; antes de eso `playNotificationSound` no suena (y no falla).
 */

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

export function unlockNotificationSound() {
  const detach = () => {
    window.removeEventListener("pointerdown", handler);
    window.removeEventListener("keydown", handler);
  };
  const handler = () => {
    getContext()
      ?.resume()
      .catch(() => undefined);
    detach();
  };
  window.addEventListener("pointerdown", handler);
  window.addEventListener("keydown", handler);
  return detach;
}

export function playNotificationSound() {
  const audio = ctx; // solo si ya se desbloqueó con una interacción
  if (!audio || audio.state !== "running") return;

  // Dos tonos cortos ascendentes ("ding-dong" invertido)
  const tones = [
    { freq: 880, start: 0 },
    { freq: 1320, start: 0.18 },
  ];
  for (const { freq, start } of tones) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const t0 = audio.currentTime + start;
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
    osc.connect(gain).connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + 0.4);
  }
}
