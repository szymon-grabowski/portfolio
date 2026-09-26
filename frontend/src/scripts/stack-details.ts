/**
 * Stack panel on 2.2: hover or keyboard focus previews what a technology does here;
 * a click (or tap, where there is no hover) pins it until another one is picked.
 */
export function initStackDetails(): void {
  const list = document.querySelector<HTMLElement>('[data-stack]');
  const detail = document.querySelector<HTMLElement>('[data-stack-detail]');
  if (!list || !detail) return;
  const name = detail.querySelector('.stack-detail__name')!;
  const text = detail.querySelector('.stack-detail__text')!;
  const buttons = [...list.querySelectorAll<HTMLButtonElement>('button[data-role]')];
  let pinned: HTMLButtonElement | null = null;

  const show = (button: HTMLButtonElement | null) => {
    name.textContent = button?.textContent ?? '';
    text.textContent = button ? (button.dataset.role ?? '') : (detail.dataset.hint ?? '');
    detail.classList.toggle('is-active', Boolean(button));
  };

  for (const button of buttons) {
    button.addEventListener('mouseenter', () => show(button));
    button.addEventListener('focus', () => show(button));
    button.addEventListener('mouseleave', () => show(pinned));
    button.addEventListener('blur', () => show(pinned));
    button.addEventListener('click', () => {
      pinned = pinned === button ? null : button;
      for (const b of buttons) b.setAttribute('aria-pressed', String(b === pinned));
      show(pinned ?? button);
    });
  }
}
