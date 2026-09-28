#!/usr/bin/env bash
# Production switch: Traefik in k3s becomes the edge (ports 80/443, Let's Encrypt, rate limits),
# fail2ban reads Traefik's access log, the host nginx is stopped.
# Usage (server, repo root, after the switch commit is on main and Argo CD has synced):
#   sudo deploy/host/install-edge.sh
# Idempotent: re-running updates the files. Rollback: docs/rollback.md.
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "run with sudo" >&2; exit 1; }
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$here/../.." && pwd)"
manifest=/var/lib/rancher/k3s/server/manifests/traefik-config.yaml
hosts=(szymongrabowski.dev www.szymongrabowski.dev next.szymongrabowski.dev grafana.szymongrabowski.dev argocd.szymongrabowski.dev)
kubectl() { k3s kubectl "$@"; }

# Argo CD must already serve the ingresses on websecure, or every host answers 404 after the switch.
entrypoint=$(kubectl -n portfolio get ingress portfolio -o jsonpath='{.metadata.annotations.traefik\.ingress\.kubernetes\.io/router\.entrypoints}')
[ "$entrypoint" = websecure ] || { echo "the portfolio ingress is still on '$entrypoint': merge the switch and wait for Argo CD" >&2; exit 1; }

backup="/root/edge-backup-$(date +%Y%m%d-%H%M%S).tgz"
mapfile -t saved < <(ls -d /etc/nginx /etc/fail2ban "$manifest" 2>/dev/null)   # a restored server has no nginx
tar -czf "$backup" "${saved[@]}"
echo "backup: $backup"

# --- Traefik's access log on the host (for fail2ban) ---
install -d -m 750 -o 65532 -g 65532 /var/log/traefik
install -m 644 "$here/logrotate/traefik" /etc/logrotate.d/traefik

# --- fail2ban: jails on Traefik's log instead of nginx's ---
install -m 644 "$here/fail2ban/filter.d/traefik-429.conf" /etc/fail2ban/filter.d/traefik-429.conf
install -m 644 "$here/fail2ban/filter.d/web-probes.conf" /etc/fail2ban/filter.d/web-probes.conf
install -m 644 "$here/fail2ban/jail.d/traefik.local" /etc/fail2ban/jail.d/traefik.local
rm -f /etc/fail2ban/jail.d/nginx.local /etc/fail2ban/filter.d/nginx-probes.conf
touch /var/log/traefik/access.log && chown 65532:65532 /var/log/traefik/access.log   # fail2ban needs the file at start
fail2ban-client -t >/dev/null || {
  echo "fail2ban config test failed, restoring $backup" >&2
  rm -f /etc/fail2ban/jail.d/traefik.local /etc/fail2ban/filter.d/traefik-429.conf /etc/fail2ban/filter.d/web-probes.conf
  tar -xzf "$backup" -C / etc/fail2ban
  exit 1
}

# --- Traefik: hostPort 80/443, ACME, middlewares ---
install -m 600 "$root/deploy/bootstrap/traefik-config.yaml" "$manifest"
echo "waiting for the new Traefik (helm-install job, then the pod)..."
timeout 300 bash -c "until k3s kubectl -n kube-system get deploy traefik -o jsonpath='{.spec.template.spec.containers[0].ports[*].hostPort}' | grep -qw 443; do sleep 3; done"
kubectl -n kube-system rollout status deploy/traefik --timeout=300s

# From here the hostPort takes 80/443 away from nginx. Wait until every host has a trusted certificate.
echo "waiting for Let's Encrypt certificates..."
for host in "${hosts[@]}"; do
  if ! timeout 300 bash -c "until curl -fsS -o /dev/null --max-time 10 https://$host/ 2>/dev/null; do sleep 5; done"; then
    echo "no valid HTTPS on $host after 5 minutes. Check: kubectl -n kube-system logs deploy/traefik | grep -i acme" >&2
    echo "nginx is still installed but no longer gets the traffic; to go back see docs/rollback.md" >&2
    exit 1
  fi
  echo "  $host: OK"
done

# --- host nginx and certbot off (configs and certificates stay on disk for a rollback) ---
for unit in nginx.service certbot.timer; do
  systemctl list-unit-files "$unit" --no-legend | grep -q . && systemctl disable --now "$unit"
done

fail2ban-client reload >/dev/null
sleep 2
fail2ban-client status traefik-limit
fail2ban-client status web-probes
echo
echo "done. Bans (after the first one): sudo nft list chain inet f2b-table f2b-edge"
echo "Lift a wrong ban (SSH is never blocked): sudo fail2ban-client unban <IP>"
