import { version } from '../../package.json';

export const SITE = {
  title: 'Szymon Grabowski — DevOps / Cloud Engineer',
  commandCenterTitle: 'Command Center — Szymon Grabowski',
  commandCenterDescription: 'Live GitOps setup behind this site: repository, CI/CD, Argo CD, Kubernetes, Grafana, Prometheus and Loki with real status LEDs.',
  ogSiteName: 'Szymon Grabowski',
  ogImageAlt: 'Szymon Grabowski, DevOps / Cloud Engineer: AWS, Terraform, Kubernetes, GitOps',
  aboutTitle: 'About me — Szymon Grabowski',
  aboutDescription: 'Szymon Grabowski, DevOps engineer: CV, LinkedIn, GitHub, certifications and contact.',
  projectTitle: 'About this project — Szymon Grabowski',
  projectDescription: 'How szymongrabowski.dev is built: GitOps on k3s, CI/CD with tests and scans, encrypted secrets, public monitoring and alerting.',
  description: 'DevOps / Cloud Engineer: AWS, Terraform, Kubernetes, GitOps. A portfolio run like a production service.',
  owner: 'SZYMON GRABOWSKI',
  role: 'DEVOPS ENGINEER',
  tags: 'INFRASTRUCTURE / AUTOMATION / OBSERVABILITY',
  /** Shown in the header; bump it in package.json (`npm version minor|patch --no-git-tag-version`). */
  version: `v${version}`,
  traits: ['DEVOPS ENGINEER', 'INFRASTRUCTURE AS CODE', 'OBSERVABILITY DRIVEN', 'CONTINUOUSLY IMPROVING'],
  motto: 'OPEN TO DEVOPS / CLOUD ROLES',
  verbs: ['DEPLOY', 'EXPLORE', 'AUTOMATE', 'IMPROVE'],
};
