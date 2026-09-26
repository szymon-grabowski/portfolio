/**
 * 2.2 About this project: goal, architecture and stack. Keep it in step with
 * deploy/ and .github/workflows/ci-cd.yml when the setup changes.
 */
import type { IconName } from '../components/ModuleIcon.astro';

export const PROJECT_GOAL = [
  'A personal site run like a production service. The page itself is static; everything around it is the work I do: infrastructure in Git, tested and scanned builds, GitOps deploys with approval and one-commit rollback, and monitoring that anyone can look at.',
  'Everything runs on one VPS. Production is still static files behind the host nginx; the same site already runs on a single-node k3s cluster at next.szymongrabowski.dev, where every component has a memory budget and a reason to be there.',
];

export interface FlowLane {
  label: string;
  steps: string[];
}

/** Read left to right; each lane is one path through the system. */
export const ARCHITECTURE: FlowLane[] = [
  { label: 'DELIVERY', steps: ['git push', 'GitHub Actions: build, e2e, Lighthouse', 'manual approval', 'rsync to the VPS (production)'] },
  { label: 'GITOPS', steps: ['same build', 'Trivy scan → image in GHCR', 'release commit (image tag)', 'Argo CD sync to k3s (next.)'] },
  { label: 'RUNTIME', steps: ['visitor', 'TLS at host nginx', 'production: static files', 'next.: Traefik → nginx pod'] },
  { label: 'OBSERVABILITY', steps: ['blackbox probes, node & pod metrics', 'Prometheus + alert rules', 'pod logs → Alloy → Loki', 'Grafana (public, read-only)'] },
];

export const PRINCIPLES = [
  'Everything declared in Git: Helm charts, Argo CD apps, dashboards, alert rules',
  'Non-root containers, read-only root filesystem, default-deny network policies',
  'Memory requests match measured peaks; limits on every container',
  'Rollback = git revert of the release commit',
];

export const STACK = [
  'Astro', 'TypeScript', 'nginx', 'Docker', 'GitHub Actions', 'Playwright', 'Lighthouse CI', 'Trivy',
  'Helm', 'Argo CD', 'k3s', 'Traefik', 'Prometheus', 'Loki', 'Alloy', 'Grafana',
];

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
