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

Deploy by serving `dist/` with Caddy or nginx; `deploy/Caddyfile` has a ready config
(compression + long-term caching of hashed assets).

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
│   ├── ModuleIcon.astro       line icons (placeholders for official logos)
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
    └── world-map.ts           map bitmap
```

## Common changes

- **Text on the page:** `src/data/site.ts`
- **Boot speed:** `BOOT_TIMING` in `src/data/boot.ts`
- **New theme:** one entry in `src/data/themes.ts`; CSS and the picker update automatically
- **Command Center cards and links:** `src/data/modules.ts` (every `href: '#'` still needs a real target)
- **Colors in new components:** only theme variables (`--accent`, `--accent-text`, `--muted`, `--ok`, `--line`, `--card`…), never hex values
