/**
 * Renders the link-preview image and the iOS home-screen icon into public/:
 *   npm run build && npm run preview -- --port 4400   (in another terminal, or already running)
 *   PORT=4400 npm run og
 * Commit the two PNGs; the Docker build (Alpine, no browser) only copies them.
 */
import { chromium } from '@playwright/test';

const base = `http://localhost:${process.env.PORT ?? 4321}`;
const browser = await chromium.launch();

const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await og.goto(`${base}/og-image/`);
await og.evaluate(() => document.fonts.ready);
await og.screenshot({ path: 'public/og.png' });

// 180x180 PNG of the favicon (iOS and some messengers ignore SVG icons). Full-bleed dark
// background: iOS rounds the corners itself, transparent or white corners would show.
const icon = await browser.newPage({ viewport: { width: 180, height: 180 } });
await icon.setContent(`<body style="margin:0;background:#0d0a15"><img src="${base}/favicon.svg" width="180" height="180"></body>`);
await icon.waitForLoadState('networkidle');
await icon.screenshot({ path: 'public/apple-touch-icon.png' });

await browser.close();
console.log('public/og.png, public/apple-touch-icon.png');
