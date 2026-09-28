# Odtworzenie od zera

Klaster nie ma backupu, bo nie potrzebuje: konfiguracja jest w Git, sekrety w `deploy/secrets/` (SOPS/age), a certyfikaty
Traefik wystawi na nowo. Tracimy tylko historię metryk i logów (retencja i tak 7 dni).

Potrzebne z menedżera haseł: **klucz prywatny age** („portfolio age key”, linia `AGE-SECRET-KEY-...`).

1. **DNS najpierw** (Let's Encrypt sprawdza domenę przez HTTP): rekordy A `@`, `www`, `next`, `grafana`, `argocd` →
   IP nowego serwera. Nowy IP wpisz też w `ignoreip` w `deploy/host/fail2ban/jail.d/traefik.local` (commit).
2. Nowy VPS z Ubuntu 24.04: SSH z kluczem, `01-hardening.conf`, UFW (`22`, `80`, `443`) — etap 1.
   Narzędzia: `sudo apt install -y fail2ban age` oraz helm, yq, sops (etap 3a).
3. Repo i k3s (instaluje też Traefika na 80/443):
   ```bash
   git clone https://github.com/szymon-grabowski/portfolio.git ~/portfolio && cd ~/portfolio
   sudo deploy/bootstrap/install-k3s.sh
   ```
4. Argo CD; po nim Argo CD sam wdraża resztę z Git (namespace'y, monitoring, stronę):
   ```bash
   deploy/bootstrap/install-argocd.sh
   ```
5. Sekrety. Grafana i Alertmanager czekają na nie (pody w `Init` / `ContainerCreating`), to normalne:
   ```bash
   install -m 600 /dev/null /tmp/age.key && nano /tmp/age.key     # wklej klucz prywatny, zapisz
   SOPS_AGE_KEY_FILE=/tmp/age.key deploy/bootstrap/apply-secrets.sh
   shred -u /tmp/age.key
   kubectl -n argocd delete secret argocd-initial-admin-secret     # hasło admina jest już to z SOPS
   ```
6. Brzeg: fail2ban i logrotate (nginx na nowym serwerze nie ma, skrypt to pomija):
   ```bash
   sudo deploy/host/install-edge.sh
   ```
   Skrypt czeka na certyfikaty wszystkich hostów. Jeśli DNS jeszcze się nie rozszedł, poczekaj i uruchom go ponownie;
   gdy Traefik nie ponawia ACME: `kubectl -n kube-system rollout restart deploy/traefik`.
7. Sprawdź: `kubectl get pods -A`, https://argocd.szymongrabowski.dev (wszystkie aplikacje Synced/Healthy),
   stronę, Grafanę; w healthchecks.io check wraca na „up”; testowy alert na Discorda (`docs/infrastructure.md`, „Alerty”).

Ścieżka nie była jeszcze przećwiczona na czystej maszynie: zrób to raz na tymczasowym VPS (bez zmiany DNS,
certyfikaty wtedy nie powstaną, reszta tak).
