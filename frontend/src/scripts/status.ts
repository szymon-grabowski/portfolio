/**
 * Live LEDs: reads /api/status (the site_status Prometheus series) and sets each
 * [data-check] card to ok / fail / unknown, plus the summary in the header.
 * Missing data is "unknown", never "ok": the page must not claim health it cannot see.
 */
import { STATUS_HOSTS, STATUS_REFRESH_MS, STATUS_TEXT, STATUS_URL } from '../data/status';

type State = 'ok' | 'fail' | 'unknown';

declare global {
  interface Window {
    /** Test hook: e2e runs point the page at a mocked endpoint. */
    __STATUS_URL__?: string;
  }
}

async function fetchStatus(url: string): Promise<Map<string, boolean> | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const body = await res.json();
    const checks = new Map<string, boolean>();
    for (const series of body?.data?.result ?? []) {
      const check = series?.metric?.check;
      if (typeof check === 'string') checks.set(check, series.value?.[1] === '1');
    }
    return checks;
  } catch {
    return null;
  }
}

function render(checks: Map<string, boolean> | null): void {
  for (const card of document.querySelectorAll<HTMLElement>('[data-check]')) {
    const value = checks?.get(card.dataset.check ?? '');
    const state: State = value === undefined ? 'unknown' : value ? 'ok' : 'fail';
    card.dataset.state = state;
    const text = card.querySelector('[data-status-text]');
    if (text) text.textContent = state === 'ok' ? card.dataset.ok! : state === 'fail' ? card.dataset.fail! : 'no data';
  }

  const summary = document.querySelector<HTMLElement>('[data-status-summary]');
  if (!summary) return;
  const values = checks ? [...checks.values()] : [];
  const failing = values.filter((ok) => !ok).length;
  const state: State = values.length === 0 ? 'unknown' : failing ? 'fail' : 'ok';
  summary.dataset.state = state;
  const text = summary.querySelector('[data-status-text]');
  if (text) {
    text.textContent =
      state === 'unknown' ? STATUS_TEXT.unavailable : failing ? STATUS_TEXT.failing(failing, values.length) : STATUS_TEXT.ok;
  }
}

export function initStatus(): void {
  if (!document.querySelector('[data-status-summary], [data-check]')) return;
  const url = window.__STATUS_URL__ ?? (STATUS_HOSTS.test(location.hostname) ? STATUS_URL : null);
  if (!url) {
    render(null);
    return;
  }
  const refresh = async () => render(await fetchStatus(url));
  void refresh();
  setInterval(() => {
    if (document.visibilityState === 'visible') void refresh();
  }, STATUS_REFRESH_MS);
}
