import { version } from '../../package.json';

export const SITE = {
  title: 'Szymon Grabowski — DevOps Portfolio',
  commandCenterTitle: 'Command Center — Szymon Grabowski',
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
