# Powrót do nginx na hoście

Po przełączeniu na k3s (etap 13). Kopia konfiguracji sprzed przełączenia: `~/przed-k8s/k3s-config.yaml`.

```bash
sudo install -m 600 ~/przed-k8s/k3s-config.yaml /etc/rancher/k3s/config.yaml   # z disable: [servicelb]
sudo systemctl restart k3s
sudo ss -ltnp | grep -E ':(80|443) '        # nic nie może słuchać
sudo systemctl start nginx
```

Z laptopa: `curl -I https://szymongrabowski.dev/` → 200.

Wycofanie samej wersji strony (bez zmiany infrastruktury): `git revert <commit "deploy: portfolio ...">` i push.
