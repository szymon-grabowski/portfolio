/**
 * Command Center content. Every card links somewhere real: replace each
 * `href: '#'` before publishing (repo, CI runs, dashboards, CV file…).
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
      { title: 'CI/CD', status: 'pipeline green', description: 'Build, test\nand deploy', icon: 'githubactions', href: '#', external: true },
      { title: 'Argo CD', status: 'healthy', description: 'GitOps\ndeployments', icon: 'argo', href: '#', external: true },
      { title: 'Kubernetes', status: 'healthy', description: 'Cluster status\nand resources', icon: 'kubernetes', href: '#' },
    ],
  },
  {
    label: 'OBSERVABILITY / METRICS / LOGS',
    modules: [
      { title: 'Grafana', status: 'healthy', description: 'Metrics\nand dashboards', icon: 'grafana', href: '#', external: true },
      { title: 'Prometheus', status: 'scraping', description: 'Metrics\nand alerting', icon: 'prometheus', href: '#', external: true },
      { title: 'Loki', status: 'running', description: 'Log aggregation\nand search', icon: 'loki', href: '#', external: true },
    ],
  },
  {
    label: 'PORTFOLIO / PROFILE',
    modules: [
      { title: 'Architecture', status: 'up to date', description: 'System design\nand diagrams', icon: 'architecture', href: '#' },
      { title: 'CV', status: 'available', description: 'Experience\nand skills', icon: 'document', href: '#' },
      { title: 'LinkedIn', status: 'online', description: "Let's connect", icon: 'linkedin', href: 'https://www.linkedin.com/in/szymon-grabowskii/', external: true },
    ],
  },
];

export const MODULE_COUNT = MODULE_GROUPS.reduce((n, g) => n + g.modules.length, 0);
