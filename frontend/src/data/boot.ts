/**
 * Lines shown in the boot log, in order. The profile lines end in [OK]; the last one
 * reports how many live checks pass (scripts/status.ts), e.g. [8/8] green or [7/8] yellow.
 */
export const BOOT_STEPS: { text: string; modules?: true }[] = [
  { text: 'Loading profile' },
  { text: 'Stack: AWS · Terraform · Kubernetes' },
  // \u00a0 keeps product names on one line when the log wraps on narrow phones.
  { text: 'CI/CD: GitLab · GitHub\u00a0Actions · Argo\u00a0CD' },
  { text: 'Location: Racibórz · remote / hybrid' },
  { text: 'System ready', modules: true },
];

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
