# szymongrabowski.dev

DevOps portfolio: a static Astro site on one VPS. Production (`szymongrabowski.dev`) is served by nginx on the
host; the same site already runs on a single-node k3s cluster at `next.szymongrabowski.dev`, deployed with GitOps
(Argo CD), until production switches over.

| Path | Contents |
|---|---|
| `frontend/` | Astro site, tests, Dockerfile, nginx config ([README](frontend/README.md)) |
| `deploy/bootstrap/` | k3s and Argo CD installation (run once on the server) |
| `deploy/charts/` | own Helm charts: `portfolio` (site), `platform` (namespaces, policies) |
| `deploy/values/` | values for vendor charts (Argo CD, Prometheus, Loki, Alloy, Grafana, blackbox) |
| `deploy/argocd/` | root Application and one Application per component |
| `deploy/scripts/` | CI resource check, k3s backup |
| `docs/` | infrastructure summary, restore and rollback runbooks |
| `.github/workflows/ci-cd.yml` | tests → image → approval → GitOps release |

Deploy: push to `main` → checks → approve in GitHub (environment `production`) →
- production: CI copies the build to the host (rsync);
- `next.`: CI pushes the image to GHCR and commits its tag → Argo CD syncs.

Rollback: `git revert` the change on `main` (CI redeploys both). For `next.` alone, reverting the
`deploy: portfolio …` commit is enough. Details: [`docs/`](docs/).

Decisions:
- DNS: plain A records; certificates via HTTP-01, so no DNS API is needed.
- Off-site backup: restic, target to be chosen (B2 or S3).
- Admin UIs: Grafana and Argo CD are public and read-only (anonymous viewer, no Explore, no pod logs,
  no sync); administration needs a login. Prometheus and Loki only through Grafana panels or an SSH tunnel.
- Secrets: never in Git. Today created by hand in the cluster (`grafana-admin`); SOPS is planned, not in use.
