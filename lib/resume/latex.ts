/**
 * Small, purpose-built LaTeX helpers. These are NOT a general LaTeX parser:
 * they only handle the constructs used by the two supported templates.
 */

export interface BraceResult {
  content: string;
  end: number; // index just past the closing brace
}

/** Read a balanced `{...}` group. `openIndex` must point at the opening `{`. */
export function readBraces(src: string, openIndex: number): BraceResult | null {
  if (src[openIndex] !== '{') return null;
  let depth = 0;
  for (let i = openIndex; i < src.length; i++) {
    const ch = src[i];
    if (ch === '\\') {
      i++; // skip escaped char
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return { content: src.slice(openIndex + 1, i), end: i + 1 };
      }
    }
  }
  return null;
}

/** Read `n` consecutive `{...}` groups starting at/after `index` (skipping whitespace). */
export function readArgs(
  src: string,
  index: number,
  n: number
): { args: string[]; end: number } | null {
  const args: string[] = [];
  let i = index;
  for (let k = 0; k < n; k++) {
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] !== '{') return null;
    const res = readBraces(src, i);
    if (!res) return null;
    args.push(res.content);
    i = res.end;
  }
  return { args, end: i };
}

/**
 * Find every occurrence of `\command` and read its first `n` brace arguments.
 * Returns the args plus the index just past them (useful for scanning bullets
 * that follow a heading).
 */
export function findCommandOccurrences(
  src: string,
  command: string,
  n: number
): { args: string[]; start: number; end: number }[] {
  const results: { args: string[]; start: number; end: number }[] = [];
  const needle = '\\' + command;
  let from = 0;
  while (true) {
    const idx = src.indexOf(needle, from);
    if (idx === -1) break;
    // Ensure the command name is not a prefix of a longer command.
    const after = src[idx + needle.length];
    if (after && /[a-zA-Z]/.test(after)) {
      from = idx + needle.length;
      continue;
    }
    const read = readArgs(src, idx + needle.length, n);
    if (read) {
      results.push({ args: read.args, start: idx, end: read.end });
      from = read.end;
    } else {
      from = idx + needle.length;
    }
  }
  return results;
}

/** Extract the section body for `\section{Title}` or `\section*{Title}`. */
export function sliceSections(
  src: string
): { title: string; body: string }[] {
  const re = /\\section\*?\s*\{/g;
  const sections: { title: string; body: string }[] = [];
  const heads: { title: string; bodyStart: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const braceStart = m.index + m[0].length - 1;
    const titleRes = readBraces(src, braceStart);
    if (!titleRes) continue;
    heads.push({ title: cleanText(titleRes.content), bodyStart: titleRes.end });
    re.lastIndex = titleRes.end;
  }
  for (let i = 0; i < heads.length; i++) {
    const start = heads[i].bodyStart;
    const end = i + 1 < heads.length
      ? src.indexOf('\\section', start)
      : src.length;
    sections.push({ title: heads[i].title, body: src.slice(start, end === -1 ? src.length : end) });
  }
  return sections;
}

const UNESCAPE_PAIRS: [RegExp, string][] = [
  [/\\&/g, '&'],
  [/\\%/g, '%'],
  [/\\\$/g, '$'],
  [/\\#/g, '#'],
  [/\\_/g, '_'],
  [/\\\{/g, '{'],
  [/\\\}/g, '}'],
  [/\\textasciitilde\{\}/g, '~'],
  [/\\textasciicircum\{\}/g, '^'],
  [/\\textbackslash\{\}/g, '\\'],
  [/\\ldots/g, '...'],
  [/---/g, '\u2014'],
  [/--/g, '\u2013'],
];

/**
 * Convert a LaTeX fragment to plain text: unwrap common formatting commands,
 * flatten links to their display text, and unescape special characters.
 */
export function cleanText(fragment: string): string {
  let out = fragment;
  // \href{url}{display} -> display
  out = replaceCommand2(out, 'href', (_url, disp) => disp);
  // \url{url} -> url
  out = replaceCommand1(out, 'url', (url) => url);
  // Unwrap single-argument formatting commands.
  for (const cmd of ['underline', 'textbf', 'textit', 'emph', 'text', 'small', 'texttt', 'mbox']) {
    out = replaceCommand1(out, cmd, (inner) => inner);
  }
  out = out.replace(/\$\|\$/g, '|');
  out = out.replace(/\\\\/g, ' ');
  out = out.replace(/\\vspace\s*\{[^}]*\}/g, '');
  out = out.replace(/\\[ ,;!]/g, ' ');
  for (const [re, rep] of UNESCAPE_PAIRS) out = out.replace(re, rep);
  out = out.replace(/[{}]/g, '');
  out = out.replace(/\s+/g, ' ').trim();
  return out;
}

/** Replace all `\cmd{a}` using the given transform on the single argument. */
export function replaceCommand1(
  src: string,
  cmd: string,
  fn: (a: string) => string
): string {
  const needle = '\\' + cmd;
  let out = '';
  let i = 0;
  while (i < src.length) {
    const idx = src.indexOf(needle, i);
    if (idx === -1) {
      out += src.slice(i);
      break;
    }
    const after = src[idx + needle.length];
    if (after && /[a-zA-Z]/.test(after)) {
      out += src.slice(i, idx + needle.length);
      i = idx + needle.length;
      continue;
    }
    const read = readArgs(src, idx + needle.length, 1);
    if (!read) {
      out += src.slice(i, idx + needle.length);
      i = idx + needle.length;
      continue;
    }
    out += src.slice(i, idx) + fn(read.args[0]);
    i = read.end;
  }
  return out;
}

/** Replace all `\cmd{a}{b}` using the given transform on both arguments. */
export function replaceCommand2(
  src: string,
  cmd: string,
  fn: (a: string, b: string) => string
): string {
  const needle = '\\' + cmd;
  let out = '';
  let i = 0;
  while (i < src.length) {
    const idx = src.indexOf(needle, i);
    if (idx === -1) {
      out += src.slice(i);
      break;
    }
    const after = src[idx + needle.length];
    if (after && /[a-zA-Z]/.test(after)) {
      out += src.slice(i, idx + needle.length);
      i = idx + needle.length;
      continue;
    }
    const read = readArgs(src, idx + needle.length, 2);
    if (!read) {
      out += src.slice(i, idx + needle.length);
      i = idx + needle.length;
      continue;
    }
    out += src.slice(i, idx) + fn(read.args[0], read.args[1]);
    i = read.end;
  }
  return out;
}

/** Pull the first URL out of a fragment (`\href{url}{..}` or `\url{url}`). */
export function extractUrl(fragment: string): string {
  const href = findCommandOccurrences(fragment, 'href', 2)[0];
  if (href) return href.args[0].trim();
  const url = findCommandOccurrences(fragment, 'url', 1)[0];
  if (url) return url.args[0].trim();
  return '';
}

/** Escape plain text for safe insertion into LaTeX. */
export function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/\u2014/g, '---')
    .replace(/\u2013/g, '--');
}
