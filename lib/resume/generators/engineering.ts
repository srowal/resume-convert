import { Resume } from '../types';
import { escapeLatex } from '../latex';

function displayUrl(url: string): string {
  return url
    .replace(/^mailto:/i, '')
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '');
}

const PREAMBLE = String.raw`\documentclass[a4paper,11pt]{article}

\usepackage[margin=1in]{geometry}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage[hidelinks]{hyperref}

\titleformat{\section}{\large\bfseries}{}{0em}{}[\titlerule]
\titlespacing{\section}{0pt}{10pt}{6pt}
\setlist[itemize]{leftmargin=*, itemsep=1pt, topsep=2pt}
\pagestyle{empty}`;

function header(r: Resume): string {
  const parts: string[] = [];
  if (r.email)
    parts.push(`\\href{mailto:${r.email}}{${escapeLatex(r.email)}}`);
  if (r.portfolio)
    parts.push(`\\href{${r.portfolio}}{${escapeLatex(displayUrl(r.portfolio))}}`);
  if (r.github)
    parts.push(`\\href{${r.github}}{${escapeLatex(displayUrl(r.github))}}`);
  if (r.linkedin)
    parts.push(`\\href{${r.linkedin}}{${escapeLatex(displayUrl(r.linkedin))}}`);
  if (r.phone) parts.push(escapeLatex(r.phone));

  return `\\begin{center}
    {\\LARGE \\textbf{${escapeLatex(r.name)}}} \\\\ \\vspace{4pt}
    ${parts.join(' $\\cdot$ ')}
\\end{center}`;
}

function itemize(bullets: string[]): string {
  if (bullets.length === 0) return '';
  const items = bullets
    .map((b) => `    \\item ${escapeLatex(b)}`)
    .join('\n');
  return `\\begin{itemize}[leftmargin=*]
${items}
\\end{itemize}`;
}

function skillsSection(r: Resume): string {
  if (r.skills.length === 0) return '';
  const lines = r.skills
    .map(
      (s) => `\\textbf{${escapeLatex(s.category)}}: ${escapeLatex(s.items.join(', '))}`
    )
    .join(' \\\\\n');
  return `\\section*{Skills}
${lines}`;
}

function experienceSection(r: Resume): string {
  if (r.experience.length === 0) return '';
  const entries = r.experience
    .map((e) => {
      const company = e.company ? `, ${escapeLatex(e.company)}` : '';
      const loc = e.location ? ` \\hfill ${escapeLatex(e.location)}` : '';
      const head = `\\textbf{${escapeLatex(e.title)}}${company}${loc} \\\\
\\textit{${escapeLatex(e.date)}}`;
      const list = itemize(e.bullets);
      return list ? `${head}\n${list}` : head;
    })
    .join('\n\n');
  return `\\section*{Experience}
${entries}`;
}

function projectsSection(r: Resume): string {
  if (r.projects.length === 0) return '';
  const entries = r.projects
    .map((p) => {
      const link = p.link
        ? ` \\hfill \\href{${p.link}}{${escapeLatex(displayUrl(p.link))}}`
        : '';
      const head = `\\textbf{${escapeLatex(p.name)}}${link}`;
      const list = itemize(p.bullets);
      return list ? `${head}\n${list}` : head;
    })
    .join('\n\n');
  return `\\section*{Projects}
${entries}`;
}

function educationSection(r: Resume): string {
  if (r.education.length === 0) return '';
  const entries = r.education
    .map((e) => {
      const date = e.date ? ` \\hfill ${escapeLatex(e.date)}` : '';
      const degree = e.degree ? `\n\\textit{${escapeLatex(e.degree)}}` : '';
      return `\\textbf{${escapeLatex(e.school)}}${date} \\\\${degree}`;
    })
    .join('\n\n');
  return `\\section*{Education}
${entries}`;
}

export function generateEngineering(r: Resume): string {
  const body = [
    skillsSection(r),
    experienceSection(r),
    projectsSection(r),
    educationSection(r),
  ]
    .filter(Boolean)
    .join('\n\n');

  return `${PREAMBLE}

\\begin{document}

${header(r)}

${body}

\\end{document}
`;
}
