# Szymon Grabowski — DevOps Portfolio

Static landing page built with Astro + TypeScript. No UI framework: every
interactive part is a small TypeScript module.

## Commands

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # type-check + static build into dist/
npm run preview   # serve dist/ locally

npx playwright install --with-deps chromium firefox   # once: browsers for the E2E tests
npm test          # build + HTML validation + E2E/accessibility tests (Playwright)
npm run test:e2e  # E2E only, against the existing dist/
```

Careful on the production server: `npm run build` (and so `npm test`) writes straight
into the live `dist/`. Run the tests on your own machine or let CI do it.

Production is served by nginx straight from `dist/` (see below).

## CI/CD

`.github/workflows/ci-cd.yml` runs on every push and pull request that touches `frontend/`:

| Job | Checks |
| --- | --- |
| Build & static checks | `npm ci`, `npm audit` (production deps), `astro check` + build, HTML validation, internal links (lychee) |
| E2E & accessibility | Playwright on the built `dist/`: Chromium, Firefox and a phone; boot, START, theme picker, cards and links, layout/monitor frame, axe WCAG 2.1 AA, no console errors |
| Lighthouse | accessibility, best practices and SEO must score ≥ 0.9–0.95; performance < 0.9 is a warning |
| Deploy to production | only on `main`, only after all of the above **and a manual approval** |
| Helm charts & manifests | `helm lint`, render, `kubeconform`, memory limits and securityContext check |
| Container image | build, push to GHCR (tag = commit SHA), Trivy scan (only on `main`) |
| Release | after the approved deploy: sets `image.tag` in `deploy/charts/portfolio/values-prod.yaml`, Argo CD syncs |

The deploy job copies the **same `dist/` that was tested** to the server with rsync (no
build on the server), then checks that the live `index.html` matches it and that
`/command-center/` and an asset return 200.

### Deploying

1. Push or merge to `main`.
2. When the checks pass, the run shows *Waiting for review* → **Review deployments** →
   tick `production` → **Approve and deploy**.

A run can also be started by hand: Actions → CI/CD → **Run workflow** (branch `main`).
If several pushes wait for approval, only the newest one stays in the queue.

### One-time setup

On the server, a key used only for deployments:

```bash
ssh-keygen -t ed25519 -N '' -C github-deploy -f ~/.ssh/github_deploy
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_deploy          # → secret SSH_PRIVATE_KEY, then: rm ~/.ssh/github_deploy
ssh-keyscan -p 22 <server-ip>     # → secret SSH_KNOWN_HOSTS
```

On GitHub: Settings → Environments → **New environment** `production`:

- **Required reviewers:** yourself (this is the manual approval step)
- **Deployment branches and tags:** Selected → `main`
- **Secrets** (everything about the server; GitHub shows them as `***` in logs):
  - `SSH_PRIVATE_KEY`, the whole private key file
  - `SSH_KNOWN_HOSTS`, the whole `ssh-keyscan` output
  - `DEPLOY_HOST` (server IP or hostname)
  - `DEPLOY_USER` (the SSH user)
  - `DEPLOY_PATH` (the nginx `root`, e.g. `/home/<user>/portfolio/frontend/dist`)
  - optionally `DEPLOY_PORT` (default 22)
- **Variables:** only `SITE_URL` (`https://szymongrabowski.dev`), the public address.
  Variables are printed in plain text in the logs: never put anything else there.

Before copying, the job refuses to run unless `$DEPLOY_PATH/index.html` already exists,
so a wrong path cannot be wiped by `rsync --delete`.

### Security (public repository = public logs)

Anyone can read the Actions logs and download the artifacts of this repository. So:

- Server details live only in **environment secrets**, never in variables, workflow
  files or commit messages. Each secret is passed only to the step that uses it.
- The deploy job never prints values: no `set -x`, no verbose flags, ssh runs with
  `LogLevel QUIET`, and ssh/rsync error output is discarded; error messages name the
  failing setting, not its value.
- Pull requests (also from forks) run only the checks: they get no secrets, and the
  `production` environment accepts only `main`.
- Artifacts contain only the public build and test reports.
- Recommended repo settings:
  - Settings → Actions → General → **Require approval for all external contributors**
  - Settings → Actions → General → Workflow permissions: **Read repository contents**
  - Settings → Environments → production: **Required reviewers** and branch `main`
  - a branch ruleset on `main` requiring the CI checks to pass

If a secret ever shows up in a log: delete that workflow run (run page → ⋯ → Delete
workflow run) and replace the secret (for SSH: a new key, old one removed from
`~/.ssh/authorized_keys`).

## Updating the server by hand

The manual way, if CI is unavailable. The site is built directly on the server
(`vmi3603348`), and nginx serves the build output in place:
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
- **Command Center cards and links:** `src/data/modules.ts` (Architecture and CV still use `href: '#'`)
- **Colors in new components:** only theme variables (`--accent`, `--accent-text`, `--muted`, `--ok`, `--line`, `--card`…), never hex values
