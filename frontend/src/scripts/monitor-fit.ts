/**
 * Scales the monitor to fit the window. Below MIN_SCALE the text would be
 * unreadably small, so the frame is dropped and the screen fills the window.
 */
const RIG_WIDTH = 1312;              // casing width
const RIG_HEIGHT = 768 + 86 + 18;    // casing + neck + foot
const MARGIN_X = 80;
const MARGIN_Y = 48;
const MIN_SCALE = 0.62;
const MAX_SCALE = 1.25;

export function initMonitorFit(): void {
  const rig = document.querySelector<HTMLElement>('[data-monitor-rig]');
  if (!rig) return;

  const fit = () => {
    const scale = Math.min(
      (window.innerWidth - MARGIN_X) / RIG_WIDTH,
      (window.innerHeight - MARGIN_Y) / RIG_HEIGHT,
      MAX_SCALE,
    );
    const framed = scale >= MIN_SCALE;
    document.body.classList.toggle('framed', framed);
    rig.style.transform = framed ? `scale(${scale})` : '';
  };

  // Resize fires many times per frame while dragging; recalculate at most once per frame.
  let queued = false;
  window.addEventListener('resize', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fit();
    });
  });
  fit();
}
