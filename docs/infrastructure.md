# Infrastruktura: podsumowanie

Stan: 2026-09-28 (po przełączeniu produkcji na k3s, etap 13). Pliki w repo są źródłem prawdy; ten dokument je streszcza.

## Architektura

```
Internet :80/:443 → Traefik (k3s, hostPort; TLS, limity) → portfolio (nginx, 1 replika)
                 └ access log → fail2ban (bany w nftables)
                                   ▲
GitHub Actions → GHCR (obraz :SHA) │ Argo CD ← Git (deploy/**)
                                   │
Prometheus + blackbox ─┐           │
Loki ← Alloy (logi)  ──┴→ Grafana;  reguły alertów → Alertmanager → Discord

Publicznie tylko do odczytu: grafana.szymongrabowski.dev, argocd.szymongrabowski.dev
```

Traefik zajmuje porty 80/443 hosta przez `hostPort` (nie servicelb: klipper-lb maskaraduje ruch, więc limity
i fail2ban widziałyby jego IP zamiast IP odwiedzającego). Certyfikaty: ACME Let's Encrypt (HTTP-01), `acme.json`
na PVC (local-path, w backupie k3s). nginx na hoście jest wyłączony; jego konfiguracja i certyfikaty Certbota
zostały na dysku na wypadek `docs/rollback.md`. `next.szymongrabowski.dev` serwuje ten sam build z `noindex`.

## Wersje

| Komponent | Wersja |
|---|---|
| k3s | v1.36.4+k3s1 (Traefik 3.7.8) |
| Argo CD | chart 10.9.2 (v3.5.3) |
| kube-prometheus-stack | 91.5.2 |
| blackbox-exporter | 11.19.1 |
| Loki | grafana-community 18.13.5 (3.7.8) |
| Grafana | grafana-community 13.2.5 (13.2.2) |
| Alloy | 1.12.1 |
| Helm CLI | v4.3.0 |

Wersje chartów są w `deploy/argocd/applications/*.yaml`, k3s w `install-k3s.sh`, Argo CD w `install-argocd.sh`.

## Budżet RAM (limity)

portfolio 32Mi · Traefik 192Mi (TLS i access log mogą podnieść szczyt — sprawdź po tygodniu) · Argo CD ~2 GiB (kontroler 1Gi, server 512Mi) · Prometheus 1Gi + exportery ~420Mi ·
Loki 384Mi · Alloy 240Mi · Grafana 1Gi · Alertmanager 64Mi. Suma limitów ~5,4 GiB na 7,76 GiB (overcommit świadomy: szczyty nie nakładają się). Typowo cały stos zajmuje ~1,5–2 GB. Próg alarmowy: MemAvailable < 1 GB (alert `NodeMemoryLow`).
Requesty RAM = szczyt z 24 h (komentarze przy wartościach), żeby żaden pod nie zużywał więcej, niż deklaruje.
Kubelet `/metrics` na k3s wystawia też metryki wbudowanego apiservera/etcd — zostawiamy tylko `kubelet_*`.
Zapytania z publicznej Grafany są ograniczone (Prometheus: 30 s, 5 mln próbek; Loki: 30 s, 500 serii).

## Wdrożenie i wycofanie

- **Wdrożenie:** push na `main` → testy, charty, obraz, Trivy → **Approve** (environment `production`)
  → job `release` commituje `image.tag` → Argo CD synchronizuje → CI sprawdza `https://szymongrabowski.dev/version.txt`.
- **Wycofanie aplikacji:** `git revert <commit "deploy: portfolio ...">` + push.
- **Powrót do nginx na hoście:** `docs/rollback.md`.
- **Odtworzenie po awarii:** `docs/restore.md`.
- Commity `release` powstają w CI, więc przed własnym pushem zrób `git pull --rebase`.

## Alerty

Reguły: `additionalPrometheusRulesMap` w `deploy/values/kube-prometheus-stack.yaml`. Alertmanager wysyła je na kanał
Discorda (webhook z Secretu `alertmanager-discord`, tworzonego ręcznie do czasu SOPS), także po ustąpieniu problemu.

| Alert | Kiedy | Poziom |
|---|---|---|
| `SiteDown` | strona nie odpowiada 3 min | critical |
| `ShowcaseDown` | `next.`, Grafana lub Argo CD nie odpowiada 10 min | warning |
| `ArgoCDAppsNotHealthy` | aplikacja Argo CD nie jest Synced i Healthy 15 min | warning |
| `CertificateExpiresSoon` / `VerySoon` | certyfikat wygasa za < 21 / < 7 dni | warning / critical |
| `NodeMemoryLow` | MemAvailable < 1 GiB przez 10 min | warning |
| `NodeDiskFilling` / `AlmostFull` | wolne < 15% / < 5% na `/` | warning / critical |
| `PodRestarting`, `PodOOMKilled` | > 3 restarty w 30 min; restart przez OOM | warning |
| `DeploymentNotAvailable` | mniej gotowych replik niż zadano przez 15 min | warning |

Alertmanager działa na tym samym VPS, więc gdy padnie cały serwer, nie wyśle nic. Dlatego alert `Watchdog` (zawsze
aktywny) co 2 min pinguje healthchecks.io (Secret `alertmanager-healthchecks`). Brak pingów przez 10 min → healthchecks.io
wysyła mail i wiadomość na Discorda z zewnątrz.
Test (wiadomość na Discordzie po ~30 s, „resolved” po 5 min):
```bash
kubectl -n monitoring port-forward svc/kube-prometheus-stack-alertmanager 9093 &
curl -H 'Content-Type: application/json' -d '[{"labels":{"alertname":"Test","severity":"warning"},"annotations":{"summary":"test"}}]' http://127.0.0.1:9093/api/v2/alerts
```

## Dostęp

| | Odwiedzający (anonimowo) | Admin (logowanie) |
|---|---|---|
| Grafana | dashboardy, bez Explore i edycji | pełny |
| Argo CD | aplikacje, zasoby, historia sync (rola `role:public`); bez logów podów, exec, sync | pełny |
| Prometheus, Loki | tylko przez panele Grafany | tunel SSH |

IP w logach podów są skracane w Alloy (ostatni oktet → 0). Access log Traefika (pełne IP, dla fail2ban) jest tylko
na hoście: `/var/log/traefik/access.log`, logrotate 7 dni. HTTPS: Traefik (Let's Encrypt), HTTP → HTTPS, HSTS.

**Limity i blokady** (middleware'y Traefika w `deploy/bootstrap/traefik-config.yaml` i chart `portfolio`;
fail2ban w `deploy/host/`, instalacja: `sudo deploy/host/install-edge.sh`):

| Warstwa | Reguła | Skutek |
|---|---|---|
| Traefik, wszystkie hosty (`websecure`) | 20 zapytań/s na IP, burst 100 (dashboard: szczyt 30–36/s) | nadmiar → 429 |
| Traefik, wszystkie hosty | 20 zapytań w toku na IP | nadmiar → 429 |
| Traefik, strona (chart `portfolio`) | dodatkowo 10 zapytań/s na IP, burst 40 (wizyta: szczyt 8/s) | nadmiar → 429 |
| fail2ban `traefik-limit` | > 20 odpowiedzi 429 w 1 min | ban 1 h, kolejne ×2, maks. 1 tydzień |
| fail2ban `web-probes` | 5 prób `/.env`, `/.git`, `wp-*`, phpMyAdmin… w 10 min | ban 24 h |

Ruch do Traefika idzie przez DNAT (`hostPort`), więc omija łańcuch INPUT (UFW i domyślne bany iptables).
fail2ban banuje w nftables: tabela `inet f2b-table`, łańcuch `f2b-edge` na hooku prerouting (priorytet -300,
przed DNAT), tylko porty 80/443 — SSH działa zawsze. Zdjęcie: `sudo fail2ban-client unban <IP>` (lub `--all`).
Podgląd: `sudo fail2ban-client status traefik-limit`, `sudo nft list chain inet f2b-table f2b-edge`.
Limity są w pamięci Traefika: restart poda je zeruje. Nie chroni przed rozproszonym DDoS (wiele IP, zalanie łącza) —
na to potrzebny jest proxy typu Cloudflare.

Tunel (Prometheus lub panele bez przechodzenia przez internet):
```bash
ssh -L 19090:127.0.0.1:9090 vps "kubectl --kubeconfig ~/.kube/config -n monitoring port-forward svc/kube-prometheus-stack-prometheus 9090"
```

## Kroki ręczne (kolejność)

| # | Gdzie | Co |
|---|---|---|
| 1 | serwer | snapshot VPS, `~/przed-k8s` (etap 0) |
| 2 | laptop + serwer | klucz SSH, `01-hardening.conf`, fail2ban, UFW (etap 1) |
| 3 | GitHub | po pierwszym zielonym jobie `image`: pakiet `portfolio` → **Public** |
| 4 | serwer | helm, kubeconform, yq (etap 3a) |
| 5 | serwer | `sudo deploy/bootstrap/install-k3s.sh`; z laptopa sprawdź, że 30080 i 6443 są zamknięte |
| 6 | serwer | `deploy/bootstrap/install-argocd.sh`; zmień hasło admina Argo CD; utwórz Secret `grafana-admin` (etap 9a), do tego czasu pod Grafany czeka |
| 7 | DNS | rekordy A: `@`, `www`, `next`, `grafana`, `argocd` → IP serwera |
| 8 | GitHub | environment `production`: reviewer, branch `main`, zmienna `SITE_URL=https://szymongrabowski.dev` |
| 9 | serwer | po Prometheusie: odkomentuj `metrics` w `traefik-config.yaml` i skopiuj do `/var/lib/rancher/k3s/server/manifests/` |
| 10 | serwer | Secret `grafana-admin` (utworzony ręcznie); **SOPS jeszcze niewdrożony**: `.sops.yaml` ma szablon reguły, `deploy/secrets/` jest pusty |
| 11 | serwer | restic + `/root/k3s-backup.env`, `/usr/local/sbin/k3s-backup`, cron; test restore na VM |
| 12 | serwer | przełączenie (etap 13): po merge'u i syncu Argo CD `sudo deploy/host/install-edge.sh`; potem usuń sekrety SSH z GitHuba i klucz `github-deploy` z `~/.ssh/authorized_keys` |

Wszystkie aplikacje w `deploy/argocd/applications/` są od razu wypełnione. Po instalacji Argo CD
(krok 6) wdroży cały stos naraz, a nie etapami. Jeśli wolisz etapy, przed krokiem 6 przenieś pliki
monitoringu poza ten katalog i dodawaj je pojedynczo.

## Zasady

- Klaster zmieniamy tylko commitem. Wyjątki: bootstrap, `traefik-config.yaml` (Traefika instaluje k3s) i `deploy/host/`;
  po zmianie tych plików uruchom ponownie `install-edge.sh` (jest idempotentny).
- Argo CD nie zarządza sam sobą: zmiana w `deploy/values/argocd.yaml` trafia do klastra dopiero po
  `deploy/bootstrap/install-argocd.sh` (bez sudo).
- Sekrety nigdy jawnie w Git. Dziś tworzone ręcznie w klastrze (`grafana-admin`); docelowo zaszyfrowane SOPS w `deploy/secrets/`. Hasło restic jest w menedżerze haseł.
- Każdy kontener ma request i limit pamięci oraz hardened `securityContext` (sprawdza to CI).
- Grafana i Argo CD publiczne tylko do odczytu; zapis i administracja tylko po zalogowaniu. Logi bez pełnych IP, retencja 7 dni.
- Kopię `restore.md` i `rollback.md` trzymaj też poza serwerem (przy awarii repo może być niedostępne).
