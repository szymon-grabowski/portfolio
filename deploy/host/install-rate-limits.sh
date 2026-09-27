#!/usr/bin/env bash
# Rate limits on the host nginx + fail2ban bans for floods and scanners.
# Usage (server, repo root): sudo deploy/host/install-rate-limits.sh
# Idempotent: re-running updates the files and never duplicates the includes.
# On a failed config test everything is restored from the backup and nothing is reloaded.
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "run with sudo" >&2; exit 1; }
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
backup="/root/rate-limits-backup-$(date +%Y%m%d-%H%M%S).tgz"

tar -czf "$backup" /etc/nginx /etc/fail2ban
echo "backup: $backup"
restore() {
  echo "config test failed, restoring $backup" >&2
  rm -f /etc/nginx/conf.d/rate-limits.conf /etc/nginx/snippets/limit-site.conf /etc/nginx/snippets/limit-conn.conf \
        /etc/fail2ban/jail.d/nginx.local /etc/fail2ban/filter.d/nginx-probes.conf
  tar -xzf "$backup" -C /
  exit 1
}

# --- nginx ---
install -m 644 "$here/nginx/conf.d/rate-limits.conf" /etc/nginx/conf.d/rate-limits.conf
install -m 644 "$here/nginx/snippets/limit-site.conf" /etc/nginx/snippets/limit-site.conf
install -m 644 "$here/nginx/snippets/limit-conn.conf" /etc/nginx/snippets/limit-conn.conf

# One include under the first server_name (the HTTPS server block) of each site.
add_include() {
  local site="/etc/nginx/sites-available/$1" snippet="$2"
  grep -q "include snippets/$snippet;" "$site" && return 0
  sed -i "0,/^\(\s*\)server_name .*;/s//&\n\1include snippets\/$snippet;/" "$site"
}
add_include szymongrabowski.dev limit-site.conf
for site in grafana argocd next; do add_include "$site.szymongrabowski.dev" limit-conn.conf; done

nginx -t || restore

# --- fail2ban ---
install -m 644 "$here/fail2ban/jail.d/nginx.local" /etc/fail2ban/jail.d/nginx.local
install -m 644 "$here/fail2ban/filter.d/nginx-probes.conf" /etc/fail2ban/filter.d/nginx-probes.conf
fail2ban-client -t >/dev/null || restore

systemctl reload nginx
fail2ban-client reload >/dev/null
sleep 2
fail2ban-client status nginx-limit-req
fail2ban-client status nginx-probes
echo
echo "done. Lift a wrong ban (SSH is never blocked): sudo fail2ban-client unban <IP>"
