/**
 * Open a LaTeX document in a fresh Overleaf project using their documented
 * document-import endpoint. This is how the user compiles to PDF and continues
 * editing, since this app compiles nothing server-side.
 */
export function openInOverleaf(latex: string): void {
  const form = document.createElement('form');
  form.action = 'https://www.overleaf.com/docs';
  form.method = 'POST';
  form.target = '_blank';
  form.rel = 'noopener';
  form.style.display = 'none';

  const field = document.createElement('textarea');
  field.name = 'snip';
  field.value = latex;
  form.appendChild(field);

  const engine = document.createElement('input');
  engine.name = 'engine';
  engine.value = 'pdflatex';
  form.appendChild(engine);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
