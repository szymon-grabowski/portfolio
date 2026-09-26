/**
 * Live status for the header and the Command Center LEDs. The data is the `site_status`
 * Prometheus series (one per check, 1 = OK), served read-only by nginx at /api/status
 * (deploy/charts/portfolio, recording rules in deploy/values/kube-prometheus-stack.yaml).
 */
export type CheckName = 'site' | 'repository' | 'cicd' | 'argocd' | 'kubernetes' | 'grafana' | 'prometheus' | 'loki';

/** Production is still served outside the cluster, so every host reads the endpoint on next. */
export const STATUS_URL = 'https://next.szymongrabowski.dev/api/status';

/** Only the real site asks for status; local previews and Lighthouse runs stay neutral. */
export const STATUS_HOSTS = /(^|\.)szymongrabowski\.dev$/;

export const STATUS_REFRESH_MS = 60_000;

export const STATUS_TEXT = {
  checking: 'CHECKING SYSTEMS',
  ok: 'ALL SYSTEMS OPERATIONAL',
  unavailable: 'STATUS UNAVAILABLE',
  /** n = failing checks, total = checks reported. */
  failing: (n: number, total: number) => `${n} OF ${total} CHECKS FAILING`,
};
