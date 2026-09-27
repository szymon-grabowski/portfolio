# Odtworzenie klastra po awarii

Potrzebne z menedżera haseł: `/root/k3s-backup.env` (restic). Hasło admina Grafany (Secret `grafana-admin`) — do czasu wdrożenia SOPS.

1. Nowy VPS z Ubuntu 24.04: SSH, UFW (etap 1), helm, kubeconform i yq (etap 3a).
2. `git clone https://github.com/szymon-grabowski/portfolio.git ~/portfolio && cd ~/portfolio`
3. Przywróć backup:
   ```bash
   sudo apt install -y restic sqlite3
   sudo install -m 600 /dev/stdin /root/k3s-backup.env      # wklej zawartość, Ctrl+D
   sudo bash -c 'source /root/k3s-backup.env && restic restore latest --tag k3s --target /restore'
   B=/restore/var/lib/k3s-backup-staging
   sudo install -D -m 600 $B/config.yaml /etc/rancher/k3s/config.yaml
   sudo install -D -m 600 $B/state.db /var/lib/rancher/k3s/server/db/state.db
   sudo install -D -m 600 $B/token /var/lib/rancher/k3s/server/token
   sudo cp -a $B/cred $B/tls /var/lib/rancher/k3s/server/
   sudo cp -a /restore/var/lib/rancher/k3s/storage /var/lib/rancher/k3s/
   ```
4. `sudo deploy/bootstrap/install-k3s.sh`
5. `kubectl get pods -A`: Argo CD dociąga stan z Git.
6. Secret Grafany (do czasu wdrożenia SOPS tworzony ręcznie):
   `kubectl -n monitoring create secret generic grafana-admin --from-literal=admin-user=admin --from-literal=admin-password='...'`
7. DNS na nowy adres IP, jeśli się zmienił; sprawdź stronę, Grafanę i Argo CD.

Przy pierwszym teście sprawdź ścieżki: `sudo find /restore -maxdepth 4`.
