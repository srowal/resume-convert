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
  readBraces,
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

function parseHeader(latex: string, resume: Resume): void {
  const centerMatch = latex.match(/\\begin\{center\}([\s\S]*?)\\end\{center\}/);
  const block = centerMatch ? centerMatch[1] : latex.slice(0, 800);

  const nameMatch =
    block.match(/\\scshape\s+([^}\\]+)/) ||
    block.match(/\\(?:Huge|LARGE|Large)\s+([^}\\]+)/) ||
    block.match(/\\textbf\{\s*([^}\\]+)\}/);
  if (nameMatch) resume.name = cleanText(nameMatch[1]);

  for (const href of findCommandOccurrences(block, 'href', 2)) {
    const url = href.args[0].trim();
    classifyLink(url, resume);
  }

  const stripped = block.replace(/\\href\{[^}]*\}\{[^}]*\}/g, ' ');
  const phoneMatch = stripped.match(/(\+?\d[\d\s().-]{6,}\d)/);
  if (phoneMatch) resume.phone = phoneMatch[1].trim();
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

/** Collect `\resumeItem{...}` bullets that appear between two offsets. */
function bulletsBetween(body: string, start: number, end: number): string[] {
  const region = body.slice(start, end);
  return findCommandOccurrences(region, 'resumeItem', 1)
    .map((o) => cleanText(o.args[0]))
    .filter(Boolean);
}

function parseEducation(body: string): EducationEntry[] {
  return findCommandOccurrences(body, 'resumeSubheading', 4).map((o) => ({
    school: cleanText(o.args[0]),
    location: cleanText(o.args[1]),
    degree: cleanText(o.args[2]),
    date: cleanText(o.args[3]),
  }));
}

function parseExperience(body: string): ExperienceEntry[] {
  const headings = findCommandOccurrences(body, 'resumeSubheading', 4);
  return headings.map((o, i) => {
    const end = i + 1 < headings.length ? headings[i + 1].start : body.length;
    return {
      title: cleanText(o.args[0]),
      date: cleanText(o.args[1]),
      company: cleanText(o.args[2]),
      location: cleanText(o.args[3]),
      bullets: bulletsBetween(body, o.end, end),
    };
  });
}

function parseProjects(body: string): ProjectEntry[] {
  const headings = findCommandOccurrences(body, 'resumeProjectHeading', 2);
  return headings.map((o, i) => {
    const end = i + 1 < headings.length ? headings[i + 1].start : body.length;
    const inner = o.args[0];
    const nameMatch = inner.match(/\\textbf\{([^}]*)\}/);
    const techMatch = inner.match(/\\emph\{([^}]*)\}/);
    const link = extractUrl(inner);
    const technologies = techMatch
      ? cleanText(techMatch[1])
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    return {
      name: nameMatch ? cleanText(nameMatch[1]) : cleanText(inner),
      technologies,
      link,
      date: cleanText(o.args[1]),
      bullets: bulletsBetween(body, o.end, end),
    };
  });
}

function parseSkills(body: string): SkillCategory[] {
  const skills: SkillCategory[] = [];
  const re = /\\textbf\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const braceStart = m.index + m[0].length - 1;
    const cat = readBraces(body, braceStart);
    if (!cat) continue;
    // The items follow, typically wrapped as `{: a, b, c}` up to `\\` or newline.
    const rest = body.slice(cat.end);
    const itemsMatch = rest.match(/^\s*\{?\s*:?\s*([^\\\n}]*)/);
    const raw = itemsMatch ? itemsMatch[1] : '';
    const items = cleanText(raw)
      .replace(/^:\s*/, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    skills.push({ category: cleanText(cat.content), items });
    re.lastIndex = cat.end;
  }
  return skills;
}

export function parseJakes(latex: string): Resume {
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
      "This looks like Jake's Resume, but the name in the header couldn't be read. The header may have been modified beyond the supported structure."
    );
  }
  if (
    resume.education.length === 0 &&
    resume.experience.length === 0 &&
    resume.projects.length === 0
  ) {
    throw new ResumeParseError(
      "This looks like Jake's Resume, but none of the Education, Experience, or Projects sections matched the supported structure. No conversion was performed."
    );
  }
  return resume;
}
