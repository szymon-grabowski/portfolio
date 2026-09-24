/**
 * Scales the monitor to fit the window. The frame is dropped (the screen fills
 * the window) when the text would be unreadably small (below MIN_SCALE), or when
 * the window is so tall that the monitor would float in empty space: portrait
 * monitors, tablets and phones.
 */
const RIG_WIDTH = 1312;              // casing width
const RIG_HEIGHT = 768 + 86 + 18;    // casing + neck + foot
const MARGIN_X = 80;
const MARGIN_Y = 48;
const MIN_SCALE = 0.62;
const MAX_SCALE = 1.25;
/** Minimum share of the window height the scaled monitor must fill. */
const MIN_HEIGHT_FILL = 0.6;
/**
 * Without the frame, windows wider than this (large portrait monitors) zoom the
 * content up. It must stay above every CSS breakpoint: media queries see the real
 * window width, so zooming a narrower window would lay out content that no longer fits.
 */
const FULLSCREEN_BASE_WIDTH = 1100;
const FULLSCREEN_MAX_ZOOM = 1.3;

export function initMonitorFit(): void {
  const rig = document.querySelector<HTMLElement>('[data-monitor-rig]');
  if (!rig) return;

  const fit = () => {
    const fitScale = Math.min(
      (window.innerWidth - MARGIN_X) / RIG_WIDTH,
      (window.innerHeight - MARGIN_Y) / RIG_HEIGHT,
    );
    // The fill test uses the uncapped scale: it should only catch windows that are too
    // tall for their width. With MAX_SCALE applied, a large landscape window (e.g. browser
    // zoomed out below 100%) would also fail it and wrongly drop the frame.
    const framed = fitScale >= MIN_SCALE && (RIG_HEIGHT * fitScale) / window.innerHeight >= MIN_HEIGHT_FILL;
    const scale = Math.min(fitScale, MAX_SCALE);
    document.body.classList.toggle('framed', framed);
    rig.style.transform = framed ? `scale(${scale})` : '';
    // Phone-sized text looks lost on a big portrait screen: grow it with the window width.
    const zoom = Math.min(Math.max(window.innerWidth / FULLSCREEN_BASE_WIDTH, 1), FULLSCREEN_MAX_ZOOM);
    rig.style.zoom = !framed && zoom > 1 ? String(zoom) : '';
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
