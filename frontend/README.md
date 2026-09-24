# Szymon Grabowski — DevOps Portfolio

Static landing page built with Astro + TypeScript. No UI framework: every
interactive part is a small TypeScript module.

## Commands

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # type-check + static build into dist/
npm run preview   # serve dist/ locally
```

Production is served by nginx straight from `dist/` (see below).
`deploy/Caddyfile` is an alternative Caddy config, not used on the current server.

## Updating the server

There is no CI/CD yet. The site is built directly on the server (`vmi3603348`), and
nginx serves the build output in place:
`/etc/nginx/sites-available/szymongrabowski.dev` has
`root /home/szymon/portfolio/frontend/dist`. After a successful build the new version
is live at once; no copying and no nginx reload are needed.

### 1. Build (with checks)

`package.json` is in `frontend/`, not in the repo root; running npm from
`~/portfolio` fails with `ENOENT ... /home/szymon/portfolio/package.json`.

```bash
cd ~/portfolio/frontend
npm ci            # clean install from package-lock.json (skip if dependencies did not change)
npm run build     # astro check (types + .astro templates), then the static build into dist/
```

The build must end with `0 errors` and `[build] Complete!`. `astro check` runs first,
so on a check error the live `dist/` stays untouched and the old version keeps working.

If `npm ci` fails with `ENOTEMPTY: directory not empty` (an interrupted or parallel
install), run `rm -rf node_modules` and repeat `npm ci`.

### 2. Check the live site

```bash
D=https://szymongrabowski.dev
curl -sI $D/ | grep -iE '^HTTP|cache-control'                                  # 200, no-cache
curl -sI $D/command-center/ | grep -iE '^HTTP'                                 # 200
curl -sI "$D$(curl -s $D/ | grep -o '/_astro/[^")]*' | head -1)" \
  | grep -iE '^HTTP|cache-control'                                             # 200, immutable
curl -sI http://szymongrabowski.dev/ | grep -iE '^HTTP|location'               # 301 to https
```

Then open https://szymongrabowski.dev in a private window (so no old cached files
hide a problem) and check:

- [ ] Boot sequence plays and START appears (any key or a click skips it)
- [ ] START types `./start.sh` and opens `/command-center/`
- [ ] Browser Back returns to the start screen and START works again
- [ ] THEME: every theme applies, and the choice survives a reload
- [ ] THEME → "Replay boot sequence" works on both pages
- [ ] Layout is fine on a narrow window (phone width) and a wide one
- [ ] Browser console (F12) shows no errors

### Changing the nginx config

Content changes never need this. Only after editing the nginx site config:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Structure

```
src/
├── pages/
│   ├── index.astro            start screen (boot sequence)
│   └── command-center.astro   /command-center/, opened by START
├── layouts/
│   ├── BaseLayout.astro       <head>, font preload, theme CSS, pre-paint script, client entry
│   └── ScreenLayout.astro     monitor + header + content + optional footer (shared by pages)
├── components/
│   ├── Monitor.astro          casing, neck, foot, guide lines
│   ├── Header.astro           name, tags, version, status LED
│   ├── ThemePicker.astro      THEME button + panel (rendered from data/themes.ts)
│   ├── BootSequence.astro     boot log, prompt, map, verbs
│   ├── StartButton.astro
│   ├── WorldMap.astro         dotted map, generated at build time
│   ├── CommandCenter.astro    title bar + module groups
│   ├── ModuleCard.astro       one card
│   ├── ModuleIcon.astro       brand marks + line icons, all in the theme color
│   └── Footer.astro
├── styles/
│   ├── global.css             imports everything below, in order
│   ├── themes.css             derived tones (palettes come from data/themes.ts)
│   ├── base.css               reset, typography, shared utilities
│   ├── layout.css             header / main / footer grid
│   ├── monitor.css            monitor frame (only when body.framed)
│   ├── header.css
│   ├── theme-picker.css
│   ├── boot.css
│   ├── start-button.css
│   ├── world-map.css
│   ├── footer.css
│   └── command-center.css
├── scripts/
│   ├── main.ts                entry: wires all modules together
│   ├── boot-sequence.ts       progress animation, skip, replay
│   ├── start-button.ts        types the command, then opens Command Center
│   ├── theme.ts               apply / persist theme
│   ├── theme-picker.ts        panel open/close, radio handling
│   ├── monitor-fit.ts         scales the monitor or drops the frame
│   ├── motion.ts              reduced-motion check, wait()
│   └── storage.ts             safe localStorage / sessionStorage
└── data/
    ├── site.ts                all visible copy
    ├── themes.ts              all theme colors (single source of truth)
    ├── boot.ts                boot steps, timing budget, START command and target
    ├── modules.ts             Command Center groups and cards (links go here)
    ├── brand-icons.ts         official logos as single-color paths (sources inside)
    └── world-map.ts           map bitmap
```

## Common changes

- **Text on the page:** `src/data/site.ts`
- **Boot speed:** `BOOT_TIMING` in `src/data/boot.ts`
- **New theme:** one entry in `src/data/themes.ts`; CSS and the picker update automatically
- **Command Center cards and links:** `src/data/modules.ts` (every `href: '#'` still needs a real target)
- **Colors in new components:** only theme variables (`--accent`, `--accent-text`, `--muted`, `--ok`, `--line`, `--card`…), never hex values
