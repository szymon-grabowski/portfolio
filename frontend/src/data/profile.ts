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
  /** Text copied by a copy button next to the card (e.g. the email address). */
  copy?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  /** Year, "05.2026" or "in progress"; shown as is. */
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
/** File name offered by the download button. */
export const CV_FILENAME = 'Szymon-Grabowski-CV.pdf';

export const PROFILE = {
  name: 'Szymon Grabowski',
  role: 'DevOps Engineer',
  location: 'Racibórz, Poland · remote',
  bio: [
    'I work as a DevOps Engineer. I design AWS infrastructure as code, automate server configuration and application deployments, and set up monitoring and runbooks.',
    'Before that I spent a year keeping IT systems running in Żabka Polska’s logistics operations: diagnosing incidents, finding root causes and documenting fixes for recurring failures. This site is my own application on a VPS with k3s, run end to end by me; 2.2 shows how.',
  ],
  focus: ['AWS', 'Terraform / Terragrunt', 'Kubernetes · Helm · Argo CD', 'GitHub Actions · GitLab CI', 'Prometheus · Grafana · Loki', 'Ansible · Linux'],
  email: 'grabowski.szymon@proton.me',
};

export interface Job {
  company: string;
  role: string;
  /** "03.2026 – present" */
  period: string;
  /** One-line context under the title. */
  context?: string;
  points: string[];
}

/** Newest first. */
export const EXPERIENCE: Job[] = [
  {
    company: 'CloudForge',
    role: 'DevOps Engineer',
    period: '03.2026 – present',
    context: 'Remote',
    points: [
      'Design AWS infrastructure as code with Terraform and Terragrunt, with separate environments and remote state.',
      'Configure VPC networking, IAM policies and access to AWS services.',
      'Write Ansible roles for Linux and administration scripts in Python and Bash.',
      'Build GitHub Actions and GitLab CI pipelines that build Docker images, push them to ECR and deploy to EKS with Helm and Argo CD.',
      'Set up monitoring and alerting with Prometheus, Grafana and Alertmanager, and write the runbooks behind it.',
    ],
  },
  {
    company: 'CloudForge',
    role: 'DevOps Mentoring Program',
    period: '09.2025 – 03.2026',
    points: [
      'Developed AWS, CI/CD, Kubernetes and monitoring skills under the mentorship of senior engineers.',
    ],
  },
  {
    company: 'Żabka Polska',
    role: 'IT Operations Specialist',
    period: '09.2024 – 09.2025',
    context: 'IT operations in a logistics environment',
    points: [
      'Maintained IT systems in a logistics environment and supported users.',
      'Diagnosed incidents, found the root causes of failures and escalated complex issues.',
      'Documented fixes for recurring failures and the procedures for handling them.',
    ],
  },
];

export interface SkillGroup {
  label: string;
  items: string[];
}

export const SKILLS: SkillGroup[] = [
  { label: 'AWS', items: ['EC2', 'S3', 'RDS', 'EKS', 'ECR', 'VPC', 'IAM', 'Route 53', 'CloudWatch'] },
  { label: 'Infrastructure as Code', items: ['Terraform', 'Terragrunt', 'separate environments', 'remote state'] },
  { label: 'Automation', items: ['Ansible', 'Python', 'Bash'] },
  { label: 'CI/CD & Git', items: ['GitHub Actions', 'GitLab CI', 'Git'] },
  { label: 'Containers', items: ['Docker', 'Kubernetes (EKS, k3s)', 'Helm', 'Argo CD'] },
  { label: 'Monitoring & logs', items: ['Prometheus', 'Grafana', 'Grafana Cloud', 'Alertmanager', 'Loki'] },
  { label: 'Linux & network', items: ['Ubuntu / Debian', 'VPC', 'DNS', 'IAM policies'] },
];

export const EDUCATION = {
  school: 'WSB Merito University',
  degree: 'BEng in Computer Science, Cloud Developer specialisation (in progress)',
  period: '10.2025 – 02.2029',
};

export const LANGUAGES = ['Polish: native', 'English: B2'];

export const PROFILE_LINKS: ProfileLink[] = [
  { title: 'LinkedIn', description: 'Experience and network', icon: 'linkedin', href: 'https://www.linkedin.com/in/szymon-grabowskii/', external: true },
  { title: 'GitHub', description: 'Code and other projects', icon: 'github', href: 'https://github.com/szymon-grabowski', external: true },
  { title: 'Email', description: PROFILE.email, icon: 'mail', href: `mailto:${PROFILE.email}`, copy: PROFILE.email },
];

export const CERTIFICATIONS: Certification[] = [];

export const PROJECTS: Project[] = [];
