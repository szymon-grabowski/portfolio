# szymongrabowski.dev

DevOps portfolio: a static Astro site on one VPS, served by an nginx container in a single-node k3s cluster and
deployed with GitOps (Argo CD). Traefik is the edge: ports 80/443, Let's Encrypt certificates, per-IP rate limits;
fail2ban on the host bans floods and scanners from Traefik's access log. `next.szymongrabowski.dev` serves the same
build (noindex).

| Path | Contents |
|---|---|
| `frontend/` | Astro site, tests, Dockerfile, nginx config ([README](frontend/README.md)) |
| `deploy/bootstrap/` | k3s and Argo CD installation (run once on the server) |
| `deploy/charts/` | own Helm charts: `portfolio` (site), `platform` (namespaces, policies) |
| `deploy/values/` | values for vendor charts (Argo CD, Prometheus, Loki, Alloy, Grafana, blackbox) |
| `deploy/argocd/` | root Application and one Application per component |
| `deploy/host/` | host side of the edge: fail2ban jails, logrotate, the switch script `install-edge.sh` |
| `deploy/scripts/` | CI resource check, k3s backup |
| `docs/` | infrastructure summary, restore and rollback runbooks |
| `.github/workflows/ci-cd.yml` | tests → image → approval → GitOps release |

Deploy: push to `main` → checks → image to GHCR (Trivy) → approve in GitHub (environment `production`) →
CI commits the image tag → Argo CD syncs → CI checks the live version.

Rollback: `git revert` the `deploy: portfolio …` commit. Back to the host nginx: [`docs/rollback.md`](docs/rollback.md).
Details: [`docs/`](docs/).

Decisions:
- DNS: plain A records; certificates from Traefik's ACME (HTTP-01), so no DNS API is needed.
- Edge: Traefik on hostPort 80/443, not servicelb, which would hide the client IP from rate limits and fail2ban.
- Off-site backup: restic, target to be chosen (B2 or S3).
- Admin UIs: Grafana and Argo CD are public and read-only (anonymous viewer, no Explore, no pod logs,
  no sync); administration needs a login. Prometheus and Loki only through Grafana panels or an SSH tunnel.
- Secrets: never in Git. Today created by hand in the cluster (`grafana-admin`); SOPS is planned, not in use.
