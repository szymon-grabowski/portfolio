#!/usr/bin/env bash
# Installed as /usr/local/sbin/k3s-backup, run daily by cron as root.
set -euo pipefail

# shellcheck disable=SC1091
source /root/k3s-backup.env   # RESTIC_REPOSITORY, RESTIC_PASSWORD, provider credentials

work=/var/lib/k3s-backup-staging
rm -rf "$work"
install -d -m 700 "$work"
trap 'rm -rf "$work"' EXIT

sqlite3 /var/lib/rancher/k3s/server/db/state.db ".backup '$work/state.db'"
cp /var/lib/rancher/k3s/server/token "$work/token"
cp -r /var/lib/rancher/k3s/server/cred /var/lib/rancher/k3s/server/tls "$work/"
cp /etc/rancher/k3s/config.yaml "$work/"

restic backup --tag k3s "$work" /var/lib/rancher/k3s/storage
restic forget --tag k3s --keep-daily 7 --keep-weekly 4 --prune

metrics=/var/lib/node_exporter/textfile
mkdir -p "$metrics"
echo "k3s_backup_last_success_timestamp_seconds $(date +%s)" > "$metrics/k3s_backup.prom.tmp"
mv "$metrics/k3s_backup.prom.tmp" "$metrics/k3s_backup.prom"
