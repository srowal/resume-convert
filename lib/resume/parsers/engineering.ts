import {
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  Resume,
  ResumeParseError,
  SkillCategory,
} from '../types';
import {
  cleanText,
  extractUrl,
  findCommandOccurrences,
  sliceSections,
} from '../latex';

function emptyResume(): Resume {
  return {
    name: '',
    phone: '',
    email: '',
    linkedin: '',
    github: '',
    portfolio: '',
    education: [],
    experience: [],
    projects: [],
    skills: [],
  };
}

function classifyLink(url: string, resume: Resume): void {
  const lower = url.toLowerCase();
  if (lower.startsWith('mailto:')) {
    resume.email = resume.email || url.slice('mailto:'.length);
  } else if (lower.includes('linkedin.')) {
    resume.linkedin = resume.linkedin || url;
  } else if (lower.includes('github.')) {
    resume.github = resume.github || url;
  } else if (lower.includes('@') && !lower.includes('/')) {
    resume.email = resume.email || url;
  } else {
    resume.portfolio = resume.portfolio || url;
  }
}

function parseHeader(latex: string, resume: Resume): void {
  const centerMatch = latex.match(/\\begin\{center\}([\s\S]*?)\\end\{center\}/);
  const block = centerMatch ? centerMatch[1] : latex.slice(0, 800);

  const nameMatch =
    block.match(/\\(?:Huge|LARGE|Large)\s*\\?textbf\{([^}]*)\}/) ||
    block.match(/\\textbf\{\s*([^}]*)\}/) ||
    block.match(/\\(?:Huge|LARGE|Large)\s+([^}\\]+)/);
  if (nameMatch) resume.name = cleanText(nameMatch[1]);

  for (const href of findCommandOccurrences(block, 'href', 2)) {
    classifyLink(href.args[0].trim(), resume);
  }
}

/** Split a section body into entries, each beginning at a `\textbf{...}`. */
function splitEntries(
  body: string
): { label: string; start: number; end: number; region: string }[] {
  const bolds = findCommandOccurrences(body, 'textbf', 1);
  return bolds.map((o, i) => {
    const end = i + 1 < bolds.length ? bolds[i + 1].start : body.length;
    return {
      label: cleanText(o.args[0]),
      start: o.end,
      end,
      region: body.slice(o.end, end),
    };
  });
}

/** Extract `\item ...` bullets from the first itemize block in a region. */
function parseItems(region: string): string[] {
  const begin = region.indexOf('\\begin{itemize}');
  if (begin === -1) return [];
  const endIdx = region.indexOf('\\end{itemize}', begin);
  const block = region.slice(begin, endIdx === -1 ? region.length : endIdx);
  const parts = block.split(/\\item\b/).slice(1);
  return parts.map((p) => cleanText(p)).filter(Boolean);
}

/** Text of a region before any itemize / textit, split around `\hfill`. */
function headParts(region: string): { left: string; right: string } {
  let head = region;
  const cutIdx = Math.min(
    ...['\\begin{itemize}', '\\textit', '\\\\']
      .map((tok) => {
        const i = region.indexOf(tok);
        return i === -1 ? region.length : i;
      })
  );
  head = region.slice(0, cutIdx);
  const hf = head.indexOf('\\hfill');
  if (hf === -1) return { left: cleanText(head), right: '' };
  return {
    left: cleanText(head.slice(0, hf)),
    right: cleanText(head.slice(hf + '\\hfill'.length)),
  };
}

function textitOf(region: string): string {
  const m = region.match(/\\textit\{([^}]*)\}/);
  return m ? cleanText(m[1]) : '';
}

function parseSkills(body: string): SkillCategory[] {
  return findCommandOccurrences(body, 'textbf', 1).map((o) => {
    const rest = body.slice(o.end);
    const m = rest.match(/^\s*:?\s*([^\\\n]*)/);
    const items = cleanText(m ? m[1] : '')
      .replace(/^:\s*/, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return { category: o.args[0].trim(), items };
  });
}

function parseExperience(body: string): ExperienceEntry[] {
  return splitEntries(body).map((e) => {
    const { left, right } = headParts(e.region);
    const company = left.replace(/^,\s*/, '').trim();
    return {
      title: e.label,
      company,
      location: right,
      date: textitOf(e.region),
      bullets: parseItems(e.region),
    };
  });
}

function parseProjects(body: string): ProjectEntry[] {
  return splitEntries(body).map((e) => ({
    name: e.label,
    technologies: [],
    link: extractUrl(e.region),
    date: '',
    bullets: parseItems(e.region),
  }));
}

function parseEducation(body: string): EducationEntry[] {
  return splitEntries(body).map((e) => {
    const { right } = headParts(e.region);
    return {
      school: e.label,
      location: '',
      degree: textitOf(e.region),
      date: right,
    };
  });
}

export function parseEngineering(latex: string): Resume {
  const resume = emptyResume();
  parseHeader(latex, resume);

  const sections = sliceSections(latex);
  for (const { title, body } of sections) {
    const t = title.toLowerCase();
    if (t.includes('education')) resume.education = parseEducation(body);
    else if (t.includes('experience')) resume.experience = parseExperience(body);
    else if (t.includes('project')) resume.projects = parseProjects(body);
    else if (t.includes('skill')) resume.skills = parseSkills(body);
  }

  if (!resume.name) {
    throw new ResumeParseError(
      "This looks like an Engineering Resume, but the name in the header couldn't be read. The header may have been modified beyond the supported structure."
    );
  }
  if (
    resume.education.length === 0 &&
    resume.experience.length === 0 &&
    resume.projects.length === 0
  ) {
    throw new ResumeParseError(
      'This looks like an Engineering Resume, but none of the Experience, Projects, or Education sections matched the supported structure. No conversion was performed.'
    );
  }
  return resume;
}
