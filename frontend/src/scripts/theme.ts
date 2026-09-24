import { DEFAULT_THEME, THEME_IDS, THEME_STORAGE_KEY } from '../data/themes';
import { writeStorage } from './storage';

export function currentTheme(): string {
  return document.documentElement.dataset.theme ?? DEFAULT_THEME;
}

/** The saved theme is applied before paint by the inline script in BaseLayout. */
export function applyTheme(id: string): void {
  if (!THEME_IDS.includes(id)) return;
  document.documentElement.dataset.theme = id;
  writeStorage('localStorage', THEME_STORAGE_KEY, id);
}
