/** Copy buttons (components/CopyButton.astro): clipboard write, then a check mark for 1.5 s. */
const DONE_MS = 1500;

export function initCopyButtons(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
    let timer: number | undefined;
    button.addEventListener('click', async () => {
      const status = button.querySelector('[data-copy-status]');
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? '');
      } catch {
        if (status) status.textContent = 'Copy failed';
        return;
      }
      button.classList.add('is-copied');
      if (status) status.textContent = 'Copied';
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.classList.remove('is-copied');
        if (status) status.textContent = '';
      }, DONE_MS);
    });
  }
}
