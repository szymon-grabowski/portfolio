/** Lines shown in the boot log, in order. */
export const BOOT_STEPS = [
  'Initializing systems',
  'Loading modules',
  'Checking dependencies',
  'Establishing connections',
  'System ready',
] as const;

export const BOOT_TIMING = {
  /** Total time for all lines together, in ms. Split randomly between lines. */
  linesBudget: 2800,
  /** Pause after each [OK], in ms (included in the budget). */
  gapAfterLine: 80,
  /** How often the "..." dots cycle, in ms. */
  dotsInterval: 140,
};

/** Set once the sequence has played; later loads in the same session skip it. */
export const BOOT_SESSION_KEY = 'booted';

/** Command typed into the prompt when START is pressed. */
export const START_COMMAND = './start.sh';

/** Where START leads. */
export const START_TARGET = '/command-center/';
