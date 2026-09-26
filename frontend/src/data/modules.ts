/**
 * Command Center content. Observability cards open the public, read-only Grafana and Argo CD;
 * profile cards open the site's own screens 2.1 and 2.2.
 */
import type { IconName } from '../components/ModuleIcon.astro';
import type { CheckName } from './status';

export interface Module {
  title: string;
  /** Status text; with `check` it is shown only while that check passes. */
  status: string;
  /** Live check behind the LED (data/status.ts); without it the card has no health state. */
  check?: CheckName;
  /** Status text while the check fails. */
  failStatus?: string;
  description: string;
  /** Brand mark or line icon (components/ModuleIcon.astro); drawn in the theme color. */
  icon: IconName;
  href: string;
  /** Opens in a new tab (external sites). */
  external?: boolean;
}

export interface ModuleGroup {
  label: string;
  /** Wide groups span the whole row; others sit two per row. */
  wide?: boolean;
  modules: Module[];
}

export const MODULE_GROUPS: ModuleGroup[] = [
  {
    label: 'PORTFOLIO / PROFILE',
    modules: [
      { title: 'About me', status: 'open 2.1', description: 'CV, LinkedIn,\ncertifications, contact', icon: 'person', href: '/about/' },
      { title: 'About this project', status: 'open 2.2', description: 'Goal, architecture\nand stack', icon: 'architecture', href: '/project/' },
    ],
  },
  {
    label: 'OBSERVABILITY / METRICS / LOGS',
    modules: [
      { title: 'Grafana', status: 'healthy', failStatus: 'down', check: 'grafana', description: 'Metrics\nand dashboards', icon: 'grafana', href: 'https://grafana.szymongrabowski.dev', external: true },
      { title: 'Prometheus', status: 'scraping', failStatus: 'down', check: 'prometheus', description: 'Metrics\nand alerting', icon: 'prometheus', href: 'https://grafana.szymongrabowski.dev/d/rYdddlPWk', external: true },
      { title: 'Loki', status: 'running', failStatus: 'down', check: 'loki', description: 'Log aggregation\nand search', icon: 'loki', href: 'https://grafana.szymongrabowski.dev/d/portfolio-logs', external: true },
    ],
  },
  {
    label: 'GITOPS / BUILD / DEPLOYMENT',
    wide: true,
    modules: [
      { title: 'Repository', status: 'online', failStatus: 'unreachable', check: 'repository', description: 'Source code\nand configuration', icon: 'git', href: 'https://github.com/szymon-grabowski/portfolio', external: true },
      { title: 'CI/CD', status: 'pipeline green', failStatus: 'pipeline failed', check: 'cicd', description: 'Build, test\nand deploy', icon: 'githubactions', href: 'https://github.com/szymon-grabowski/portfolio/actions', external: true },
      { title: 'Argo CD', status: 'synced, healthy', failStatus: 'out of sync', check: 'argocd', description: 'GitOps\ndeployments', icon: 'argo', href: 'https://argocd.szymongrabowski.dev', external: true },
      { title: 'Kubernetes', status: 'healthy', failStatus: 'degraded', check: 'kubernetes', description: 'Cluster status\nand resources', icon: 'kubernetes', href: 'https://grafana.szymongrabowski.dev/d/k8s_views_pods', external: true },
    ],
  },
];

export const MODULE_COUNT = MODULE_GROUPS.reduce((n, g) => n + g.modules.length, 0);
