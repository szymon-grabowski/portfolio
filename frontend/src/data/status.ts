/**
 * Live status for the header and the Command Center LEDs. The data is the `site_status`
 * Prometheus series (one per check, 1 = OK), served read-only by nginx at /api/status
 * (deploy/charts/portfolio, recording rules in deploy/values/kube-prometheus-stack.yaml).
 */
/** Every live check; the boot log counts working ones against this list. */
export const CHECKS = ['site', 'repository', 'cicd', 'argocd', 'kubernetes', 'grafana', 'prometheus', 'loki'] as const;
export type CheckName = (typeof CHECKS)[number];

/** Fired on document after each status fetch; detail is StatusSummary. */
export const STATUS_EVENT = 'site-status';

/** Working checks out of all CHECKS; null = no data (fetch failed or not on the real site). */
export type StatusSummary = { ok: number; total: number } | null;

/** Same origin: every host of the site is served by the nginx pod that answers /api/status. */
export const STATUS_URL = '/api/status';

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
