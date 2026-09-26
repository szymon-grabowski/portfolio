/**
 * 2.1 About me. Sections with an empty list (certifications, projects) are not rendered,
 * so they appear as soon as the first entry is added here.
 *
 * CV: put the PDF at public/cv.pdf. The card links to it only when the file exists;
 * nginx serves it inline, so it opens in the browser's PDF viewer in a new tab.
 */
import type { IconName } from '../components/ModuleIcon.astro';

export interface ProfileLink {
  title: string;
  description: string;
  icon: IconName;
  href: string;
  external?: boolean;
}

export interface Certification {
  name: string;
  issuer: string;
  /** Year or "2026-05"; shown as is. */
  date: string;
  /** Verification page (Credly, vendor site). */
  href?: string;
}

export interface Project {
  name: string;
  description: string;
  href: string;
}

export const CV_PATH = '/cv.pdf';

export const PROFILE = {
  name: 'Szymon Grabowski',
  role: 'DevOps Engineer',
  bio: [
    'I build and run infrastructure the way I would want to inherit it: declared in code, deployed through pipelines, and observable from the first day.',
    'This site is part of that: a static page operated like a production service. See 2.2 for how it is built.',
  ],
  focus: ['Infrastructure as code', 'CI/CD and GitOps', 'Kubernetes', 'Observability', 'Automation'],
  email: 'grabowski.szymon@proton.me',
};

export const PROFILE_LINKS: ProfileLink[] = [
  { title: 'LinkedIn', description: 'Experience and network', icon: 'linkedin', href: 'https://www.linkedin.com/in/szymon-grabowskii/', external: true },
  { title: 'GitHub', description: 'Code and other projects', icon: 'github', href: 'https://github.com/szymon-grabowski', external: true },
  { title: 'Email', description: PROFILE.email, icon: 'mail', href: `mailto:${PROFILE.email}` },
];

export const CERTIFICATIONS: Certification[] = [];

export const PROJECTS: Project[] = [];
