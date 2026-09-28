/**
 * 2.2 About this project: goal, architecture and stack. Keep it in step with
 * deploy/ and .github/workflows/ci-cd.yml when the setup changes.
 */
import type { IconName } from '../components/ModuleIcon.astro';

export const PROJECT_GOAL = [
  'A personal site run like a production service. The page itself is static; everything around it is the work I do: infrastructure in Git, tested and scanned builds, GitOps deploys with approval and one-commit rollback, and monitoring that anyone can look at.',
  'Everything runs on one VPS, in a single-node k3s cluster: the site, TLS, rate limits, GitOps and monitoring. Every component has a memory budget and a reason to be there.',
];

export interface FlowLane {
  label: string;
  steps: string[];
}

/** Read left to right; each lane is one path through the system. */
export const ARCHITECTURE: FlowLane[] = [
  { label: 'DELIVERY', steps: ['git push', 'GitHub Actions: build, e2e, Lighthouse', 'Trivy scan → image in GHCR', 'manual approval'] },
  { label: 'GITOPS', steps: ['release commit (image tag)', 'Argo CD sync to k3s', 'rolling update, no downtime', 'live version check'] },
  { label: 'RUNTIME', steps: ['visitor', 'Traefik: TLS (Let\'s Encrypt), rate limits', 'nginx pod: static files', 'fail2ban bans floods and scanners'] },
  { label: 'OBSERVABILITY', steps: ['blackbox probes, node & pod metrics', 'Prometheus + alert rules', 'pod logs → Alloy → Loki', 'Grafana (public, read-only)'] },
];

export const PRINCIPLES = [
  'Everything declared in Git: Helm charts, Argo CD apps, dashboards, alert rules',
  'Non-root containers, read-only root filesystem, default-deny network policies',
  'Memory requests match measured peaks; limits on every container',
  'Rollback = git revert of the release commit',
];

export interface StackItem {
  name: string;
  /** What it does in this project (shown on hover, focus or tap). */
  role: string;
}

export const STACK: StackItem[] = [
  { name: 'Astro', role: 'Builds every page to static HTML at build time; nothing renders on a server at runtime.' },
  { name: 'TypeScript', role: 'Typed page scripts: boot sequence, themes, live status LEDs. astro check runs in CI.' },
  { name: 'nginx', role: 'Runs in a pod and serves the static files with cache and security headers; also proxies /api/status to Prometheus.' },
  { name: 'Docker', role: 'Packs nginx and the built site into one non-root image, published to GHCR.' },
  { name: 'GitHub Actions', role: 'The pipeline: build, tests, Lighthouse, Helm checks, image, manual approval, release commit.' },
  { name: 'Playwright', role: 'End-to-end tests in desktop Chrome, Firefox and a phone, with axe accessibility checks.' },
  { name: 'Lighthouse CI', role: 'Blocks a release when accessibility, best practices or SEO scores drop.' },
  { name: 'Trivy', role: 'Scans the container image for known vulnerabilities before it ships.' },
  { name: 'Helm', role: 'Own charts for the site and the platform; values files for every vendor chart.' },
  { name: 'Argo CD', role: 'GitOps: keeps the cluster identical to Git (app of apps, self-heal, prune).' },
  { name: 'k3s', role: 'Single-node Kubernetes on the VPS: the site, Argo CD and monitoring.' },
  { name: 'Traefik', role: 'The edge of k3s on ports 80/443: Let\'s Encrypt certificates, HTTPS redirect, HSTS, per-IP rate limits, routing to the nginx pod.' },
  { name: 'Prometheus', role: 'Metrics and uptime probes; recording rules behind the live LEDs, alert rules for downtime and certificates.' },
  { name: 'Loki', role: 'Stores pod logs, including the deploy history from Argo CD and the site access log.' },
  { name: 'Alloy', role: 'Collects pod logs, anonymises IP addresses and ships them to Loki.' },
  { name: 'Grafana', role: 'Public, read-only dashboards for metrics and logs.' },
];

/** Shown in the stack panel until a technology is picked. */
export const STACK_HINT = 'Hover or tap a technology to see its job here.';

export interface ProjectLink {
  title: string;
  description: string;
  icon: IconName;
  href: string;
}

export const PROJECT_LINKS: ProjectLink[] = [
  { title: 'Repository', description: 'Code, charts, docs', icon: 'git', href: 'https://github.com/szymon-grabowski/portfolio' },
  { title: 'CI/CD', description: 'Pipeline runs', icon: 'githubactions', href: 'https://github.com/szymon-grabowski/portfolio/actions' },
  { title: 'Argo CD', description: 'Live sync state', icon: 'argo', href: 'https://argocd.szymongrabowski.dev' },
  { title: 'Grafana', description: 'Metrics dashboard', icon: 'grafana', href: 'https://grafana.szymongrabowski.dev' },
  { title: 'Loki', description: 'Deploys and requests', icon: 'loki', href: 'https://grafana.szymongrabowski.dev/d/portfolio-logs' },
];
