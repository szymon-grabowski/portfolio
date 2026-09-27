# Infrastruktura: podsumowanie

Stan: 2026-09-27. Pliki w repo są źródłem prawdy; ten dokument je streszcza.

## Architektura

```
Internet → Traefik (k3s) → portfolio (nginx, 1 replika)
                                   ▲
GitHub Actions → GHCR (obraz :SHA) │ Argo CD ← Git (deploy/**)
                                   │
Prometheus + blackbox ─┐           │
Loki ← Alloy (logi)  ──┴→ Grafana (alert rules w Prometheusie)

Publicznie tylko do odczytu: grafana.szymongrabowski.dev, argocd.szymongrabowski.dev
```

Do przełączenia (etap 13) produkcję obsługuje nginx na hoście, a k3s serwuje `next.szymongrabowski.dev`
przez nginx → `127.0.0.1:30080`.

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

portfolio 32Mi · Traefik 192Mi · Argo CD ~2 GiB (kontroler 1Gi, server 512Mi) · Prometheus 1Gi + exportery ~420Mi ·
Loki 384Mi · Alloy 240Mi · Grafana 1Gi. Suma limitów ~5,3 GiB na 7,76 GiB (overcommit świadomy: szczyty nie nakładają się). Typowo cały stos zajmuje ~1,5–2 GB. Próg alarmowy: MemAvailable < 1 GB.
Requesty RAM = szczyt z 24 h (komentarze przy wartościach), żeby żaden pod nie zużywał więcej, niż deklaruje.
Kubelet `/metrics` na k3s wystawia też metryki wbudowanego apiservera/etcd — zostawiamy tylko `kubelet_*`.
Zapytania z publicznej Grafany są ograniczone (Prometheus: 30 s, 5 mln próbek; Loki: 30 s, 500 serii).

## Wdrożenie i wycofanie

- **Wdrożenie:** push na `main` → testy, charty, obraz, Trivy → **Approve** (environment `production`)
  → job `release` commituje `image.tag` → Argo CD synchronizuje.
- **Wycofanie aplikacji:** `git revert <commit "deploy: portfolio ...">` + push.
- **Wycofanie przełączenia na k3s:** `docs/rollback.md`.
- **Odtworzenie po awarii:** `docs/restore.md`.
- Commity `release` powstają w CI, więc przed własnym pushem zrób `git pull --rebase`.

## Dostęp

| | Odwiedzający (anonimowo) | Admin (logowanie) |
|---|---|---|
| Grafana | dashboardy, bez Explore i edycji | pełny |
| Argo CD | aplikacje, zasoby, historia sync (rola `role:public`); bez logów podów, exec, sync | pełny |
| Prometheus, Loki | tylko przez panele Grafany | tunel SSH |

IP w logach są skracane w Alloy (ostatni oktet → 0). nginx na hoście: HTTPS (Certbot).

**Limity i blokady** (`deploy/host/`, instalacja: `sudo deploy/host/install-rate-limits.sh`):

| Warstwa | Reguła | Skutek |
|---|---|---|
| nginx `szymongrabowski.dev` | 10 zapytań/s na IP, burst 40 (wizyta: szczyt 8/s) | nadmiar → 429 |
| nginx `grafana.`, `argocd.`, `next.` | 20 zapytań/s na IP, burst 100 (dashboard: szczyt 30–36/s) | nadmiar → 429 |
| nginx, wszystkie | 20 równoczesnych połączeń na IP | nadmiar → 429 |
| fail2ban `nginx-limit-req` | > 20 odrzuceń w 1 min | ban 1 h, kolejne ×2, maks. 1 tydzień |
| fail2ban `nginx-probes` | 5 prób `/.env`, `/.git`, `wp-*`, phpMyAdmin… w 10 min | ban 24 h |

Bany tylko na portach 80/443 — SSH działa zawsze. Zdjęcie: `sudo fail2ban-client unban <IP>` (lub `--all`).
Podgląd: `sudo fail2ban-client status nginx-limit-req`. Nie chroni przed rozproszonym DDoS (wiele IP, zalanie łącza) —
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
| 7 | DNS + serwer | rekord `next`, vhost nginx → `127.0.0.1:30080`, `certbot --nginx -d next.szymongrabowski.dev` |
| 8 | GitHub | zmienna repo `RELEASE_CHECK_URL=https://next.szymongrabowski.dev` |
| 9 | serwer | po Prometheusie: odkomentuj `metrics` w `traefik-config.yaml` i skopiuj do `/var/lib/rancher/k3s/server/manifests/` |
| 10 | serwer | Secret `grafana-admin` (utworzony ręcznie); **SOPS jeszcze niewdrożony**: `.sops.yaml` ma szablon reguły, `deploy/secrets/` jest pusty |
| 11 | serwer | restic + `/root/k3s-backup.env`, `/usr/local/sbin/k3s-backup`, cron; test restore na VM |
| 12 | wszystko | przełączenie (etap 13), potem usunięcie joba `deploy` i sekretów SSH |

Wszystkie aplikacje w `deploy/argocd/applications/` są od razu wypełnione. Po instalacji Argo CD
(krok 6) wdroży cały stos naraz, a nie etapami. Jeśli wolisz etapy, przed krokiem 6 przenieś pliki
monitoringu poza ten katalog i dodawaj je pojedynczo.

## Zasady

- Klaster zmieniamy tylko commitem. Wyjątki: bootstrap i `traefik-config.yaml` (Traefika instaluje k3s).
- Sekrety nigdy jawnie w Git. Dziś tworzone ręcznie w klastrze (`grafana-admin`); docelowo zaszyfrowane SOPS w `deploy/secrets/`. Hasło restic jest w menedżerze haseł.
- Każdy kontener ma request i limit pamięci oraz hardened `securityContext` (sprawdza to CI).
- Grafana i Argo CD publiczne tylko do odczytu; zapis i administracja tylko po zalogowaniu. Logi bez pełnych IP, retencja 7 dni.
- Kopię `restore.md` i `rollback.md` trzymaj też poza serwerem (przy awarii repo może być niedostępne).
