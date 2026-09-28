# Powrót do nginx na hoście

Po przełączeniu na k3s (etap 13, `deploy/host/install-edge.sh`). nginx, jego konfiguracja i certyfikaty Certbota
zostały na dysku, tylko są wyłączone. Kopia `/etc/nginx` i `/etc/fail2ban` sprzed przełączenia:
`/root/edge-backup-<data>.tgz`.

1. Ingressy z powrotem na entrypoint `web` (TLS znowu kończy się na nginx), CI znowu z jobem `deploy` (rsync):
   ```bash
   git revert -m 1 <merge przełączenia> && git push      # Argo CD synchronizuje w ~3 min
   ```
2. nginx i fail2ban na logach nginx. nginx może wystartować od razu: `hostPort` nie trzyma gniazda na hoście,
   a ruch dostaje dopiero po kroku 3.
   ```bash
   sudo rm /etc/fail2ban/jail.d/traefik.local /etc/fail2ban/filter.d/traefik-429.conf /etc/fail2ban/filter.d/web-probes.conf
   sudo tar -xzf /root/edge-backup-<data>.tgz -C / etc/fail2ban
   sudo fail2ban-client reload
   sudo systemctl enable --now nginx certbot.timer
   ```
3. Traefik bez `hostPort` (plik po revercie z kroku 1): od tej chwili 80/443 obsługuje nginx.
   ```bash
   sudo install -m 600 deploy/bootstrap/traefik-config.yaml /var/lib/rancher/k3s/server/manifests/traefik-config.yaml
   kubectl -n kube-system rollout status deploy/traefik
   sudo certbot renew        # certyfikaty mogły wygasnąć, gdy nginx był wyłączony
   ```
4. `/var/www/szymongrabowski.dev` ma build z dnia przełączenia: uruchom CI na `main` i zatwierdź deploy.

Z laptopa: `curl -I https://szymongrabowski.dev/` → 200, `curl -I https://grafana.szymongrabowski.dev/` → 200.

Wycofanie samej wersji strony (bez zmiany infrastruktury): `git revert <commit "deploy: portfolio ...">` i push.
