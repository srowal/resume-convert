import { TemplateId } from './types';

export const SAMPLE_JAKES = String.raw`\documentclass[letterpaper,11pt]{article}
\usepackage[hidelinks]{hyperref}
\newcommand{\resumeItem}[1]{\item\small{{#1 \vspace{-2pt}}}}
\newcommand{\resumeSubheading}[4]{\item #1 #2 #3 #4}
\newcommand{\resumeProjectHeading}[2]{\item #1 #2}
\newcommand{\resumeSubHeadingListStart}{\begin{itemize}}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}}

\begin{document}

\begin{center}
    \textbf{\Huge \scshape Jake Ryan} \\ \vspace{1pt}
    \small 123-456-7890 $|$ \href{mailto:jake@su.edu}{\underline{jake@su.edu}} $|$
    \href{https://linkedin.com/in/jake}{\underline{linkedin.com/in/jake}} $|$
    \href{https://github.com/jake}{\underline{github.com/jake}}
\end{center}

\section{Education}
  \resumeSubHeadingListStart
    \resumeSubheading
      {Southwestern University}{Georgetown, TX}
      {Bachelor of Arts in Computer Science, Minor in Business}{Aug. 2018 -- May 2021}
    \resumeSubheading
      {Blinn College}{Bryan, TX}
      {Associate's in Liberal Arts}{Aug. 2014 -- May 2018}
  \resumeSubHeadingListEnd

\section{Experience}
  \resumeSubHeadingListStart
    \resumeSubheading
      {Undergraduate Research Assistant}{June 2020 -- Present}
      {Texas A\&M University}{College Station, TX}
      \resumeItemListStart
        \resumeItem{Developed a REST API using FastAPI and PostgreSQL to store data from learning management systems}
        \resumeItem{Explored ways to visualize GitHub collaboration in a classroom setting}
      \resumeItemListEnd
    \resumeSubheading
      {Information Technology Support Specialist}{Sep. 2018 -- Present}
      {Southwestern University}{Georgetown, TX}
      \resumeItemListStart
        \resumeItem{Communicate with managers to set up campus computers used on campus}
        \resumeItem{Troubleshoot computer problems for students, faculty and staff}
      \resumeItemListEnd
  \resumeSubHeadingListEnd

\section{Projects}
    \resumeSubHeadingListStart
      \resumeProjectHeading
          {\textbf{Gitlytics} $|$ \emph{Python, Flask, React, PostgreSQL, Docker}}{June 2020 -- Present}
          \resumeItemListStart
            \resumeItem{Developed a full-stack web application using Flask serving a REST API with React as the frontend}
            \resumeItem{Implemented GitHub OAuth to get data from user's repositories}
          \resumeItemListEnd
      \resumeProjectHeading
          {\textbf{Simple Paintball} $|$ \emph{Spigot API, Java, Maven}}{May 2018 -- May 2020}
          \resumeItemListStart
            \resumeItem{Developed a Minecraft server plugin to entertain kids during free time for a summer camp}
          \resumeItemListEnd
    \resumeSubHeadingListEnd

\section{Technical Skills}
 \begin{itemize}[leftmargin=0.15in, label={}]
    \small{\item{
     \textbf{Languages}{: Java, Python, C/C++, SQL (Postgres), JavaScript, HTML/CSS, R} \\
     \textbf{Frameworks}{: React, Node.js, Flask, JUnit, WordPress, Material-UI, FastAPI} \\
     \textbf{Developer Tools}{: Git, Docker, TravisCI, Google Cloud Platform, VS Code} \\
     \textbf{Libraries}{: pandas, NumPy, Matplotlib}
    }}
 \end{itemize}

\end{document}
`;

export const SAMPLE_ENGINEERING = String.raw`\documentclass[a4paper,11pt]{article}
\usepackage[margin=1in]{geometry}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage[hidelinks]{hyperref}
\pagestyle{empty}

\begin{document}

\begin{center}
    {\LARGE \textbf{Alex Morgan}} \\ \vspace{4pt}
    \href{mailto:alex@example.com}{alex@example.com} $\cdot$
    \href{https://alexmorgan.dev}{alexmorgan.dev} $\cdot$
    \href{https://github.com/alexm}{github.com/alexm}
\end{center}

\section*{Skills}
\textbf{Languages}: TypeScript, Go, Python \\
\textbf{Frameworks}: React, Next.js, Node.js \\
\textbf{Tools}: Docker, Kubernetes, AWS

\section*{Experience}
\textbf{Senior Software Engineer}, Northwind \hfill Seattle, WA \\
\textit{Mar 2021 -- Present}
\begin{itemize}[leftmargin=*]
    \item Led the migration of a monolith to a service-oriented architecture
    \item Cut API latency by 40\% through query optimization and caching
\end{itemize}

\textbf{Software Engineer}, Acme Corp \hfill Remote \\
\textit{Jul 2018 -- Feb 2021}
\begin{itemize}[leftmargin=*]
    \item Built and shipped the customer billing dashboard used by 20k accounts
\end{itemize}

\section*{Projects}
\textbf{Streamline} \hfill \href{https://github.com/alexm/streamline}{github.com/alexm/streamline}
\begin{itemize}[leftmargin=*]
    \item Open-source workflow engine with 2k stars on GitHub
\end{itemize}

\section*{Education}
\textbf{University of Washington} \hfill Sep 2014 -- Jun 2018 \\
\textit{B.S. in Computer Science}

\end{document}
`;

export const SAMPLES: Record<TemplateId, string> = {
  jakes: SAMPLE_JAKES,
  engineering: SAMPLE_ENGINEERING,
};
