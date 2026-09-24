# Logos for Command Center cards

Put the official SVG logos here under exactly these names. Any file that is
missing falls back to the line icon at build time, so you can add them one by one.

| File             | Card        | Where to get it                                              |
|------------------|-------------|--------------------------------------------------------------|
| git.svg          | Repository  | git-scm.com → Downloads → Logos (or your Git host's brand page) |
| ci.svg           | CI/CD       | brand page of the CI you actually use (GitHub Actions, GitLab…) |
| argo.svg         | Argo CD     | github.com/cncf/artwork → projects/argo                      |
| kubernetes.svg   | Kubernetes  | github.com/cncf/artwork → projects/kubernetes                |
| prometheus.svg   | Prometheus  | github.com/cncf/artwork → projects/prometheus                |
| grafana.svg      | Grafana     | Grafana Labs press / brand page                              |
| loki.svg         | Loki        | Grafana Labs press / brand page (Loki)                       |
| linkedin.svg     | LinkedIn    | brand.linkedin.com                                           |

Tips:
- Prefer the **icon-only** variant (no wordmark): the card already shows the name.
- On a dark background pick the full-color or **white/reverse** variant; black logos disappear.
- Read each project's brand guidelines: most allow this kind of use (naming a tool you work with),
  but some forbid recoloring or cropping.
- `public/` is served as-is, so keep files small (clean SVGs, no embedded bitmaps).
