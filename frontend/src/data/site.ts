import { version } from '../../package.json';

export const SITE = {
  title: 'Szymon Grabowski — DevOps Portfolio',
  commandCenterTitle: 'Command Center — Szymon Grabowski',
  aboutTitle: 'About me — Szymon Grabowski',
  aboutDescription: 'Szymon Grabowski, DevOps engineer: CV, LinkedIn, GitHub, certifications and contact.',
  projectTitle: 'About this project — Szymon Grabowski',
  projectDescription: 'How szymongrabowski.dev is built: GitOps on k3s, CI/CD with tests and scans, public observability.',
  description: 'DevOps engineer: infrastructure as code, automation, cloud and observability.',
  owner: 'SZYMON GRABOWSKI',
  tags: 'INFRASTRUCTURE / AUTOMATION / CLOUD / OBSERVABILITY',
  /** Shown in the header; bump it in package.json (`npm version minor|patch --no-git-tag-version`). */
  version: `v${version}`,
  status: 'ALL SYSTEMS OPERATIONAL',
  traits: ['DEVOPS ENGINEER', 'INFRASTRUCTURE AS CODE', 'OBSERVABILITY DRIVEN', 'CONTINUOUSLY IMPROVING'],
  motto: 'BUILD A BETTER TOMORROW',
  verbs: ['DEPLOY', 'EXPLORE', 'AUTOMATE', 'IMPROVE'],
};
