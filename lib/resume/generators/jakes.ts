import { Resume } from '../types';
import { escapeLatex } from '../latex';

/** Strip protocol / mailto for human-readable link display text. */
function displayUrl(url: string): string {
  return url
    .replace(/^mailto:/i, '')
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '');
}

const PREAMBLE = String.raw`\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\input{glyphtounicode}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

\pdfgentounicode=1

\newcommand{\resumeItem}[1]{
  \item\small{
    {#1 \vspace{-2pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & #2 \\
    \end{tabular*}\vspace{-7pt}
}

\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}`;

function header(r: Resume): string {
  const parts: string[] = [];
  if (r.phone) parts.push(escapeLatex(r.phone));
  if (r.email)
    parts.push(`\\href{mailto:${r.email}}{\\underline{${escapeLatex(r.email)}}}`);
  if (r.linkedin)
    parts.push(`\\href{${r.linkedin}}{\\underline{${escapeLatex(displayUrl(r.linkedin))}}}`);
  if (r.github)
    parts.push(`\\href{${r.github}}{\\underline{${escapeLatex(displayUrl(r.github))}}}`);
  if (r.portfolio)
    parts.push(`\\href{${r.portfolio}}{\\underline{${escapeLatex(displayUrl(r.portfolio))}}}`);

  return `\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(r.name)}} \\\\ \\vspace{1pt}
    \\small ${parts.join(' $|$ ')}
\\end{center}`;
}

function educationSection(r: Resume): string {
  if (r.education.length === 0) return '';
  const items = r.education
    .map(
      (e) => `    \\resumeSubheading
      {${escapeLatex(e.school)}}{${escapeLatex(e.location)}}
      {${escapeLatex(e.degree)}}{${escapeLatex(e.date)}}`
    )
    .join('\n');
  return `\\section{Education}
  \\resumeSubHeadingListStart
${items}
  \\resumeSubHeadingListEnd`;
}

function bulletList(bullets: string[]): string {
  if (bullets.length === 0) return '';
  const items = bullets
    .map((b) => `        \\resumeItem{${escapeLatex(b)}}`)
    .join('\n');
  return `      \\resumeItemListStart
${items}
      \\resumeItemListEnd`;
}

function experienceSection(r: Resume): string {
  if (r.experience.length === 0) return '';
  const items = r.experience
    .map((e) => {
      const head = `    \\resumeSubheading
      {${escapeLatex(e.title)}}{${escapeLatex(e.date)}}
      {${escapeLatex(e.company)}}{${escapeLatex(e.location)}}`;
      const list = bulletList(e.bullets);
      return list ? `${head}\n${list}` : head;
    })
    .join('\n');
  return `\\section{Experience}
  \\resumeSubHeadingListStart
${items}
  \\resumeSubHeadingListEnd`;
}

function projectsSection(r: Resume): string {
  if (r.projects.length === 0) return '';
  const items = r.projects
    .map((p) => {
      const nameNode = p.link
        ? `\\href{${p.link}}{\\textbf{${escapeLatex(p.name)}}}`
        : `\\textbf{${escapeLatex(p.name)}}`;
      const tech =
        p.technologies.length > 0
          ? ` $|$ \\emph{${escapeLatex(p.technologies.join(', '))}}`
          : '';
      const head = `      \\resumeProjectHeading
          {${nameNode}${tech}}{${escapeLatex(p.date)}}`;
      const list = bulletList(p.bullets);
      return list ? `${head}\n${list}` : head;
    })
    .join('\n');
  return `\\section{Projects}
  \\resumeSubHeadingListStart
${items}
  \\resumeSubHeadingListEnd`;
}

function skillsSection(r: Resume): string {
  if (r.skills.length === 0) return '';
  const lines = r.skills
    .map(
      (s, i) =>
        `     \\textbf{${escapeLatex(s.category)}}{: ${escapeLatex(s.items.join(', '))}}${
          i < r.skills.length - 1 ? ' \\\\' : ''
        }`
    )
    .join('\n');
  return `\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${lines}
    }}
 \\end{itemize}`;
}

export function generateJakes(r: Resume): string {
  const body = [
    header(r),
    educationSection(r),
    experienceSection(r),
    projectsSection(r),
    skillsSection(r),
  ]
    .filter(Boolean)
    .join('\n\n');

  return `${PREAMBLE}

\\begin{document}

${body}

\\end{document}
`;
}
