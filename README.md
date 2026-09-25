# szymongrabowski.dev

DevOps portfolio: static Astro site on a single-node k3s cluster, deployed with GitOps (Argo CD).

| Path | Contents |
|---|---|
| `frontend/` | Astro site, tests, Dockerfile, nginx config ([README](frontend/README.md)) |
| `deploy/bootstrap/` | k3s and Argo CD installation (run once on the server) |
| `deploy/charts/` | own Helm charts: `portfolio` (site), `platform` (namespaces, policies) |
| `deploy/values/` | values for vendor charts (Argo CD, Prometheus, Loki, Alloy, Grafana, blackbox) |
| `deploy/argocd/` | root Application and one Application per component |
| `deploy/scripts/` | CI resource check, k3s backup |
| `deploy/secrets/` | SOPS-encrypted secrets only |
| `.github/workflows/ci-cd.yml` | tests → image → approval → GitOps release |

Deploy: push to `main` → checks → approve in GitHub (environment `production`) → CI commits the new
image tag → Argo CD syncs. Rollback: `git revert` the release commit.

Decisions:
- DNS: plain A records; certificates via HTTP-01, so no DNS API is needed.
- Off-site backup: restic, target to be chosen (B2 or S3).
- Admin UIs (Argo CD, Grafana, Prometheus): only through an SSH tunnel, never public.
