'use client';

import { useMemo } from 'react';

interface CodeViewerProps {
  code: string;
}

/**
 * Read-only LaTeX viewer with a line-number gutter. Text stays fully
 * selectable and copyable; there is intentionally no editing.
 */
export function CodeViewer({ code }: CodeViewerProps) {
  const lines = useMemo(() => code.replace(/\n$/, '').split('\n'), [code]);

  return (
    <div className="h-full overflow-auto bg-slate-950 font-mono text-[13px] leading-[1.6]">
      <div className="flex min-w-full">
        <div
          aria-hidden
          className="select-none border-r border-white/10 bg-slate-900/60 px-3 py-4 text-right text-slate-600"
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="flex-1 overflow-visible px-4 py-4 text-slate-200">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="whitespace-pre">
                {line || '\u00A0'}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
