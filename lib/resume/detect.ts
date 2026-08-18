import { DetectedTemplate } from './types';

const JAKE_FINGERPRINTS = [
  '\\resumeSubheading',
  '\\resumeProjectHeading',
  '\\resumeSubHeadingListStart',
  '\\resumeItemListStart',
  '\\resumeItem',
];

const ENGINEERING_SECTIONS = [
  /\\section\*\s*\{\s*Experience\s*\}/i,
  /\\section\*\s*\{\s*Education\s*\}/i,
  /\\section\*\s*\{\s*(Skills|Projects)\s*\}/i,
];

/**
 * Deterministic template detection based on structural fingerprints. No content
 * analysis or AI — either the custom Jake macros are present, or the Engineering
 * starred-section layout is.
 */
export function detectTemplate(latex: string): DetectedTemplate {
  const jakeHits = JAKE_FINGERPRINTS.filter((fp) => latex.includes(fp)).length;
  if (jakeHits >= 2) return 'jakes';

  const engHits = ENGINEERING_SECTIONS.filter((re) => re.test(latex)).length;
  if (engHits >= 2 && !latex.includes('\\resumeSubheading')) return 'engineering';

  return 'unknown';
}
