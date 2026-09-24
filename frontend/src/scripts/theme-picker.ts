import { applyTheme, currentTheme } from './theme';

interface ThemePickerOptions {
  onReplay: () => void;
}

export function initThemePicker({ onReplay }: ThemePickerOptions): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-theme-panel]');
  const replay = document.querySelector<HTMLButtonElement>('[data-boot-replay]');
  if (!toggle || !panel) return;

  const inputs = [...panel.querySelectorAll<HTMLInputElement>('input[name="theme"]')];

  // Reflect the theme already applied before paint.
  const active = currentTheme();
  inputs.forEach((input) => {
    input.checked = input.value === active;
    input.addEventListener('change', () => applyTheme(input.value));
  });

  const isOpen = () => panel.classList.contains('is-open');
  const setOpen = (open: boolean) => {
    panel.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) (inputs.find((i) => i.checked) ?? inputs[0])?.focus();
  };

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setOpen(!isOpen());
  });
  panel.addEventListener('click', (event) => event.stopPropagation());
  document.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  replay?.addEventListener('click', () => {
    setOpen(false);
    onReplay();
  });
}
