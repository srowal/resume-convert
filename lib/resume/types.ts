export type TemplateId = 'jakes' | 'engineering';
export type DetectedTemplate = TemplateId | 'unknown';

export interface EducationEntry {
  school: string;
  location: string;
  degree: string;
  date: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location: string;
  date: string;
  bullets: string[];
}

export interface ProjectEntry {
  name: string;
  technologies: string[];
  link: string;
  date: string;
  bullets: string[];
}

export interface SkillCategory {
  category: string;
  items: string[];
}

/**
 * Canonical resume representation. Every field here exists in at least one of
 * the two supported templates; the generators decide how (or whether) to render
 * each one for a given target.
 */
export interface Resume {
  name: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  portfolio: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: SkillCategory[];
}

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  jakes: "Jake's Resume",
  engineering: 'Engineering Resume',
};

/** Thrown when input does not match a supported template structure. */
export class ResumeParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResumeParseError';
  }
}

export interface AnalyzeResult {
  template: TemplateId;
  resume: Resume;
}

export interface ConvertResult {
  sourceTemplate: TemplateId;
  targetTemplate: TemplateId;
  originalLatex: string;
  convertedLatex: string;
  warnings: string[];
}
