/**
 * Safe wrappers around Web Storage: private mode, disabled cookies or a full
 * quota must never break the page, so every call is guarded.
 */
type Area = 'localStorage' | 'sessionStorage';

export function readStorage(area: Area, key: string): string | null {
  try {
    return window[area].getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(area: Area, key: string, value: string): void {
  try {
    window[area].setItem(key, value);
  } catch {
    /* ignore */
  }
}
