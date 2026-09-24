/**
 * Single source of truth for themes. BaseLayout turns `tokens` into CSS
 * custom properties at build time, and the theme picker reads the same
 * values for its swatches, so the two can never drift apart.
 *
 * scene   background around the monitor
 * bezel   monitor casing        edge   casing outline
 * bg      screen background     text   main text
 * accent  headline, lines, map
 * accentText  small accent text (lighter where accent is too dark to read)
 * muted   secondary text (card descriptions)
 * ok      status green: [OK], START, status LED
 */
export interface ThemeTokens {
  scene: string;
  bezel: string;
  edge: string;
  bg: string;
  text: string;
  accent: string;
  accentText: string;
  /** Secondary text (card descriptions). Chosen per theme: it can't be derived reliably. */
  muted: string;
  ok: string;
}

export interface Theme {
  id: string;
  name: string;
  tokens: ThemeTokens;
}

export const THEMES: Theme[] = [
  { id: 'blood', name: 'Blood Red', tokens: { scene: '#080304', bezel: '#1a1718', edge: '#2e2729', bg: '#100607', text: '#f0e4e3', accent: '#c0141f', accentText: '#e04a52', muted: '#c9b4b2', ok: '#7ccf9c' } },
  { id: 'blue', name: 'Deep Blue', tokens: { scene: '#06090e', bezel: '#17191d', edge: '#282c33', bg: '#0a1019', text: '#e3eaf3', accent: '#6aa5e8', accentText: '#6aa5e8', muted: '#aab6c6', ok: '#6fd6a0' } },
  { id: 'violet', name: 'Dusk Violet', tokens: { scene: '#07060b', bezel: '#19181d', edge: '#2c2a33', bg: '#0d0a15', text: '#e9e4f4', accent: '#a28af0', accentText: '#a28af0', muted: '#b9b1cc', ok: '#74dfa2' } },
  { id: 'graphite', name: 'Graphite Grey', tokens: { scene: '#0c0d0e', bezel: '#1b1c1e', edge: '#2e2f32', bg: '#151618', text: '#ececed', accent: '#cfd3d9', accentText: '#cfd3d9', muted: '#b3b5b9', ok: '#62d493' } },
  { id: 'void', name: 'Void', tokens: { scene: '#000000', bezel: '#0d0d0f', edge: '#1c1c20', bg: '#050506', text: '#d6d6da', accent: '#8a8d96', accentText: '#8a8d96', muted: '#9a9ba2', ok: '#57c285' } },
];

export const DEFAULT_THEME = 'violet';
export const THEME_STORAGE_KEY = 'theme';
export const THEME_IDS = THEMES.map((t) => t.id);

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** CSS rules for every theme: html[data-theme='x'] { --bg: …; … } */
export function themesToCss(): string {
  return THEMES.map(({ id, tokens }) => {
    const vars = Object.entries(tokens).map(([k, v]) => `--${kebab(k)}:${v}`).join(';');
    return `html[data-theme='${id}']{${vars}}`;
  }).join('');
}
