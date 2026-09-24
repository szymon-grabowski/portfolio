/**
 * Command Center content. Every card links somewhere real: replace each
 * `href: '#'` before publishing (repo, CI runs, dashboards, CV file…).
 */
import type { IconName } from '../components/ModuleIcon.astro';

export interface Module {
  title: string;
  status: string;
  description: string;
  /** Fallback line icon, used when `logo` is not set or its file is missing. */
  icon: IconName;
  /** Official logo file in public/logos/ (see public/logos/README.md). */
  logo?: string;
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
      { title: 'Repository', logo: '/logos/git.svg', status: 'synced', description: 'Source code\nand configuration', icon: 'repo', href: '#', external: true },
      { title: 'CI/CD', logo: '/logos/ci.svg', status: 'pipeline green', description: 'Build, test\nand deploy', icon: 'pipeline', href: '#', external: true },
      { title: 'Argo CD', logo: '/logos/argo.svg', status: 'healthy', description: 'GitOps\ndeployments', icon: 'sync', href: '#', external: true },
      { title: 'Kubernetes', logo: '/logos/kubernetes.svg', status: 'healthy', description: 'Cluster status\nand resources', icon: 'cluster', href: '#' },
    ],
  },
  {
    label: 'OBSERVABILITY / METRICS / LOGS',
    modules: [
      { title: 'Grafana', logo: '/logos/grafana.svg', status: 'healthy', description: 'Metrics\nand dashboards', icon: 'gauge', href: '#', external: true },
      { title: 'Prometheus', logo: '/logos/prometheus.svg', status: 'scraping', description: 'Metrics\nand alerting', icon: 'metrics', href: '#', external: true },
      { title: 'Loki', logo: '/logos/loki.svg', status: 'running', description: 'Log aggregation\nand search', icon: 'logs', href: '#', external: true },
    ],
  },
  {
    label: 'PORTFOLIO / PROFILE',
    modules: [
      { title: 'Architecture', status: 'up to date', description: 'System design\nand diagrams', icon: 'architecture', href: '#' },
      { title: 'CV', status: 'available', description: 'Experience\nand skills', icon: 'document', href: '#' },
      { title: 'LinkedIn', logo: '/logos/linkedin.svg', status: 'online', description: "Let's connect", icon: 'person', href: '#', external: true },
    ],
  },
];

export const MODULE_COUNT = MODULE_GROUPS.reduce((n, g) => n + g.modules.length, 0);
