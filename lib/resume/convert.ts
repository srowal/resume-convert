import { detectTemplate } from './detect';
import { parseJakes } from './parsers/jakes';
import { parseEngineering } from './parsers/engineering';
import { generateJakes } from './generators/jakes';
import { generateEngineering } from './generators/engineering';
import {
  AnalyzeResult,
  ConvertResult,
  Resume,
  ResumeParseError,
  TemplateId,
  TEMPLATE_LABELS,
} from './types';

const MAX_INPUT_CHARS = 200_000;

function parseFor(template: TemplateId, latex: string): Resume {
  return template === 'jakes' ? parseJakes(latex) : parseEngineering(latex);
}

function generateFor(template: TemplateId, resume: Resume): string {
  return template === 'jakes'
    ? generateJakes(resume)
    : generateEngineering(resume);
}

export function analyze(latex: string): AnalyzeResult {
  const trimmed = latex.trim();
  if (!trimmed) {
    throw new ResumeParseError('Please paste your LaTeX resume first.');
  }
  if (trimmed.length > MAX_INPUT_CHARS) {
    throw new ResumeParseError(
      'That document is too large to process. Please paste only the resume source.'
    );
  }

  const template = detectTemplate(latex);
  if (template === 'unknown') {
    throw new ResumeParseError(
      "We couldn't recognize this resume. Version 1 supports Jake's Resume and the Engineering Resume templates. Please paste an unmodified document from one of them."
    );
  }

  const resume = parseFor(template, latex);
  return { template, resume };
}

function conversionWarnings(resume: Resume, target: TemplateId): string[] {
  const warnings: string[] = [];

  if (target === 'engineering') {
    const techCount = resume.projects.filter((p) => p.technologies.length > 0).length;
    const dateCount = resume.projects.filter((p) => p.date.trim() !== '').length;
    if (techCount > 0 || dateCount > 0) {
      const bits: string[] = [];
      if (techCount > 0)
        bits.push(`${techCount} project technology ${techCount === 1 ? 'list' : 'lists'}`);
      if (dateCount > 0)
        bits.push(`${dateCount} project ${dateCount === 1 ? 'date' : 'dates'}`);
      warnings.push(
        `${bits.join(' and ')} could not be shown in the ${TEMPLATE_LABELS.engineering} layout, which has no place for them. Everything else was carried over.`
      );
    }
  }

  return warnings;
}

export function convert(latex: string, target: TemplateId): ConvertResult {
  const { template: sourceTemplate, resume } = analyze(latex);
  const convertedLatex = generateFor(target, resume);
  return {
    sourceTemplate,
    targetTemplate: target,
    originalLatex: latex,
    convertedLatex,
    warnings: conversionWarnings(resume, target),
  };
}
