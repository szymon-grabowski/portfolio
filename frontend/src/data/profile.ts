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
  role: 'DevOps / Cloud Engineer',
  location: 'Racibórz, Poland · remote or hybrid in Silesia',
  bio: [
    'I came to DevOps from the operations side. Two years of keeping real users, devices and systems running showed me what breaks at 8 a.m. on a Monday. Now I build platforms that prevent it: infrastructure declared in code, every change shipped through a pipeline, and every service monitored and secured from day one.',
    'At CloudForge I design and build AWS environments with Terraform and Terragrunt, GitLab CI/CD pipelines without static cloud credentials, and Kubernetes delivery with Helm and Argo CD, under the review of senior DevOps engineers. This site is a platform I run end to end myself; 2.2 shows how.',
  ],
  focus: ['AWS', 'Terraform / Terragrunt', 'Kubernetes · Helm · Argo CD', 'GitLab CI/CD', 'Prometheus · Grafana', 'Linux'],
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
    context: 'Engineering for client assignments',
    points: [
      'Build infrastructure, automation and CI/CD components from scratch, reviewed by senior DevOps engineers.',
      'Take part in technical preparation and interviews for client assignments.',
      'Own the documentation: architecture, technical decisions, deployment runbooks and recovery scenarios.',
    ],
  },
  {
    company: 'CloudForge',
    role: 'DevOps Development Program',
    period: '09.2025 – 03.2026',
    context: 'Mentored engineering projects on AWS',
    points: [
      'Built isolated AWS environments with Terraform and Terragrunt: VPC networking, IAM, ECS/EKS and observability.',
      'Created GitLab CI/CD pipelines with IaC validation, security scans and image builds, deploying through OIDC instead of static keys.',
      'Shipped to Kubernetes with Helm and Argo CD and proved health checks, rollbacks, scaling and network restrictions between services.',
      'Set up Prometheus, Grafana and Alertmanager with automated checks that metrics, alerts and availability actually work.',
      'Automated server configuration with Ansible, idempotent and repeatable.',
    ],
  },
  {
    company: 'Żabka Polska',
    role: 'IT Operations Specialist',
    period: '09.2024 – 09.2025',
    context: 'Tychy · IT operations for one of Poland’s largest retail networks',
    points: [
      'Resolved Jira requests and led second-line escalations with external vendors, in Polish and English.',
      'Managed users, groups and permissions in Active Directory, Entra ID, Exchange and logistics systems.',
      'Automated application and policy rollouts with Barramundi; analysed Palo Alto firewall logs.',
      'Ran IT onboarding and wrote the Confluence documentation behind it.',
    ],
  },
  {
    company: 'Extral',
    role: 'IT Support Contractor',
    period: '06.2024 – 09.2024',
    context: 'Żory · production environment support',
    points: [
      'Handled incidents on-site and remotely; rolled out security updates and disk encryption.',
    ],
  },
  {
    company: 'PC net (Komputronik)',
    role: 'IT Service Technician',
    period: '01.2022 – 05.2022',
    context: 'Trzcianka',
    points: [
      'Diagnosed and repaired hardware, configured LAN/WAN and client systems, ran data recovery and backups.',
    ],
  },
];

export interface SkillGroup {
  label: string;
  items: string[];
}

export const SKILLS: SkillGroup[] = [
  { label: 'Cloud & IaC', items: ['AWS: VPC, EC2, ECS/Fargate, EKS, IAM, S3, DynamoDB, ECR, CloudWatch, KMS, SQS', 'Terraform', 'Terragrunt', 'Ansible'] },
  { label: 'Containers', items: ['Docker', 'Kubernetes', 'Helm', 'Argo CD', 'GitOps', 'nginx'] },
  { label: 'CI/CD', items: ['GitLab CI/CD', 'OIDC', 'self-hosted GitLab Runner', 'Jenkins', 'Kaniko', 'Git'] },
  { label: 'Observability', items: ['Prometheus', 'Grafana', 'Alertmanager', 'CloudWatch', 'synthetic checks', 'log analysis'] },
  { label: 'Security', items: ['IAM & RBAC', 'least privilege', 'Trivy', 'tfsec', 'tflint'] },
  { label: 'Systems & network', items: ['Linux', 'Bash', 'Windows Server', 'AD / Entra ID', 'TCP/IP, DNS, DHCP, routing'] },
];

export const EDUCATION = {
  school: 'WSB Merito University, Chorzów',
  degree: 'BEng in Computer Science, Cloud Developer track',
  period: '10.2025 – 02.2029',
};

export const LANGUAGES = ['Polish: native', 'English: technical documentation and daily work in IT'];

export const PROFILE_LINKS: ProfileLink[] = [
  { title: 'LinkedIn', description: 'Experience and network', icon: 'linkedin', href: 'https://www.linkedin.com/in/szymon-grabowskii/', external: true },
  { title: 'GitHub', description: 'Code and other projects', icon: 'github', href: 'https://github.com/szymon-grabowski', external: true },
  { title: 'Email', description: PROFILE.email, icon: 'mail', href: `mailto:${PROFILE.email}` },
];

export const CERTIFICATIONS: Certification[] = [];

export const PROJECTS: Project[] = [];
