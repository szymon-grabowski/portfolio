import { START_COMMAND } from '../data/boot';
import { prefersReducedMotion, wait } from './motion';

/** START is a normal link; this types the command into the prompt before following it. */
export function initStartButton(): void {
  const link = document.querySelector<HTMLAnchorElement>('[data-start] a');
  const typed = document.querySelector<HTMLElement>('[data-prompt-input]');
  if (!link || !typed) return;

  let navigating = false;
  link.addEventListener('click', async (event) => {
    // Let modified clicks (new tab, new window) behave like any link.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    if (navigating) return;
    navigating = true;

    const delay = prefersReducedMotion() ? 0 : 35;
    typed.textContent = '';
    for (const ch of START_COMMAND) {
      typed.textContent += ch;
      await wait(delay);
    }
    await wait(delay ? 180 : 0);
    window.location.href = link.href;
  });
}
