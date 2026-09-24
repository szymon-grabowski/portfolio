import { BOOT_SESSION_KEY, BOOT_TIMING } from '../data/boot';
import { prefersReducedMotion, wait } from './motion';
import { readStorage, writeStorage } from './storage';

interface LogLine {
  root: HTMLElement;
  dots: HTMLElement;
  status: HTMLElement;
  finalDots: string;
}

export interface BootSequence {
  /** Play the sequence from the start (used by "Replay boot sequence"). */
  replay: () => void;
}

/** Split a fixed budget randomly: every visit differs, total time never changes. */
function splitBudget(total: number, parts: number): number[] {
  const weights = Array.from({ length: parts }, () => 0.8 + Math.random() * 0.4);
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => (w / sum) * total);
}

/** Uneven progress: quick jump, short stall, then finish. Maps 0..1 time to 0..100 %. */
function progressCurve(): (t: number) => number {
  const jumpTo = 35 + Math.random() * 35;
  const jumpEnd = 0.2 + Math.random() * 0.2;
  const stallEnd = Math.min(0.85, jumpEnd + 0.15 + Math.random() * 0.25);
  return (t) => {
    if (t < jumpEnd) return (t / jumpEnd) * jumpTo;
    if (t < stallEnd) return jumpTo + ((t - jumpEnd) / (stallEnd - jumpEnd)) * 4;
    return jumpTo + 4 + ((t - stallEnd) / (1 - stallEnd)) * (96 - jumpTo);
  };
}

export function initBootSequence(): BootSequence | null {
  const root = document.querySelector<HTMLElement>('[data-boot]');
  const start = document.querySelector<HTMLElement>('[data-start]');
  const startButton = start?.querySelector<HTMLElement>('a, button');
  const announcer = document.querySelector<HTMLElement>('[data-boot-status]');
  if (!root || !start || !startButton) return null;

  const lines: LogLine[] = [...root.querySelectorAll<HTMLElement>('[data-log-line]')].map((el) => {
    const dots = el.querySelector<HTMLElement>('[data-dots]')!;
    return { root: el, dots, status: el.querySelector<HTMLElement>('[data-status]')!, finalDots: dots.textContent ?? '' };
  });

  let runId = 0;

  const setLinePending = (line: LogLine) => {
    line.root.classList.add('is-pending');
    line.dots.textContent = '';
    line.status.textContent = '';
    line.status.classList.remove('is-ok');
  };
  const setLineDone = (line: LogLine) => {
    line.root.classList.remove('is-pending');
    line.dots.textContent = line.finalDots;
    line.status.textContent = '[OK]';
    line.status.classList.add('is-ok');
  };
  const showStart = (visible: boolean) => {
    start.classList.toggle('is-visible', visible);
    startButton.tabIndex = visible ? 0 : -1;
    if (announcer) announcer.textContent = visible ? 'System ready. Start button available.' : '';
  };
  // Skip listeners exist only while the sequence runs.
  let skipListeners: AbortController | null = null;
  const listenForSkip = () => {
    skipListeners?.abort();
    skipListeners = new AbortController();
    const { signal } = skipListeners;
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' && event.key !== 'Tab') skip();
    }, { signal });
    root.addEventListener('click', skip, { signal });
  };

  const complete = () => {
    skipListeners?.abort();
    skipListeners = null;
    document.documentElement.classList.remove('boot-pending');
    lines.forEach(setLineDone);
    showStart(true);
    writeStorage('sessionStorage', BOOT_SESSION_KEY, '1');
  };

  const animateLine = (line: LogLine, duration: number, id: number) =>
    new Promise<boolean>((resolve) => {
      const curve = progressCurve();
      line.root.classList.remove('is-pending');
      const t0 = performance.now();
      let lastDots = '';
      let lastStatus = '';
      const tick = (now: number) => {
        if (id !== runId) return resolve(false);
        const t = Math.min(1, (now - t0) / duration);
        // rAF runs at 60–120 fps, but the text changes far less often: touch the DOM only on change.
        const dots = '.'.repeat(1 + (Math.floor(now / BOOT_TIMING.dotsInterval) % 3));
        const status = `${Math.min(99, Math.floor(curve(t)))}%`;
        if (dots !== lastDots) line.dots.textContent = lastDots = dots;
        if (status !== lastStatus) line.status.textContent = lastStatus = status;
        if (t < 1) requestAnimationFrame(tick);
        else {
          setLineDone(line);
          resolve(true);
        }
      };
      requestAnimationFrame(tick);
    });

  const play = async () => {
    const id = ++runId;
    listenForSkip();
    showStart(false);
    lines.forEach(setLinePending);
    document.documentElement.classList.remove('boot-pending');
    const { linesBudget, gapAfterLine } = BOOT_TIMING;
    const durations = splitBudget(linesBudget - gapAfterLine * lines.length, lines.length);
    for (let i = 0; i < lines.length; i++) {
      if (!(await animateLine(lines[i], durations[i], id))) return;
      await wait(gapAfterLine);
      if (id !== runId) return;
    }
    complete();
  };

  const skip = () => {
    if (start.classList.contains('is-visible')) return;
    runId++; // stops the running sequence
    complete();
  };

  // The page is server-rendered in its final state; animate only when it makes sense.
  const alreadyBooted = readStorage('sessionStorage', BOOT_SESSION_KEY) === '1';
  if (!prefersReducedMotion() && !alreadyBooted) play();
  else complete();

  return {
    replay: () => (prefersReducedMotion() ? complete() : play()),
  };
}
