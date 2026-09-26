/**
 * Command Center content. Observability cards open the public, read-only Grafana and Argo CD;
 * profile cards open the site's own screens 2.1 and 2.2.
 */
import type { IconName } from '../components/ModuleIcon.astro';

export interface Module {
  title: string;
  status: string;
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
    label: 'GITOPS / BUILD / DEPLOYMENT',
    wide: true,
    modules: [
      { title: 'Repository', status: 'synced', description: 'Source code\nand configuration', icon: 'git', href: 'https://github.com/szymon-grabowski/portfolio', external: true },
      { title: 'CI/CD', status: 'pipeline green', description: 'Build, test\nand deploy', icon: 'githubactions', href: 'https://github.com/szymon-grabowski/portfolio/actions', external: true },
      { title: 'Argo CD', status: 'healthy', description: 'GitOps\ndeployments', icon: 'argo', href: 'https://argocd.szymongrabowski.dev', external: true },
      { title: 'Kubernetes', status: 'healthy', description: 'Cluster status\nand resources', icon: 'kubernetes', href: 'https://grafana.szymongrabowski.dev/d/k8s_views_pods', external: true },
    ],
  },
  {
    label: 'OBSERVABILITY / METRICS / LOGS',
    modules: [
      { title: 'Grafana', status: 'healthy', description: 'Metrics\nand dashboards', icon: 'grafana', href: 'https://grafana.szymongrabowski.dev', external: true },
      { title: 'Prometheus', status: 'scraping', description: 'Metrics\nand alerting', icon: 'prometheus', href: 'https://grafana.szymongrabowski.dev/d/rYdddlPWk', external: true },
      { title: 'Loki', status: 'running', description: 'Log aggregation\nand search', icon: 'loki', href: 'https://grafana.szymongrabowski.dev/d/portfolio-logs', external: true },
    ],
  },
  {
    label: 'PORTFOLIO / PROFILE',
    modules: [
      { title: 'About me', status: 'open 2.1', description: 'CV, LinkedIn,\ncertifications, contact', icon: 'person', href: '/about/' },
      { title: 'About this project', status: 'open 2.2', description: 'Goal, architecture\nand stack', icon: 'architecture', href: '/project/' },
    ],
  },
];

export const MODULE_COUNT = MODULE_GROUPS.reduce((n, g) => n + g.modules.length, 0);
