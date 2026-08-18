'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  FileText,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { analyze, convert } from '@/lib/resume/convert';
import { SAMPLES } from '@/lib/resume/samples';
import {
  AnalyzeResult,
  ConvertResult,
  ResumeParseError,
  TemplateId,
  TEMPLATE_LABELS,
} from '@/lib/resume/types';
import { CodeViewer } from '@/components/converter/code-viewer';
import { openInOverleaf } from '@/components/converter/overleaf';

const TEMPLATE_ORDER: TemplateId[] = ['jakes', 'engineering'];

function messageFor(err: unknown): string {
  if (err instanceof ResumeParseError) return err.message;
  return 'Something went wrong while reading this resume. Please check the pasted source and try again.';
}

export default function Home() {
  const [latex, setLatex] = useState('');
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [target, setTarget] = useState<TemplateId | null>(null);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [version, setVersion] = useState<'original' | 'converted'>('converted');
  const [view, setView] = useState<'latex' | 'pdf'>('latex');
  const [copied, setCopied] = useState(false);

  function handleInputChange(value: string) {
    setLatex(value);
    setAnalysis(null);
    setResult(null);
    setError(null);
  }

  function loadSample(template: TemplateId) {
    handleInputChange(SAMPLES[template]);
  }

  function handleAnalyze() {
    try {
      const res = analyze(latex);
      setAnalysis(res);
      setError(null);
      const other = TEMPLATE_ORDER.find((t) => t !== res.template) ?? res.template;
      setTarget(other);
    } catch (err) {
      setAnalysis(null);
      setError(messageFor(err));
    }
  }

  function handleConvert() {
    if (!target) return;
    try {
      const res = convert(latex, target);
      setResult(res);
      setVersion('converted');
      setView('latex');
      setError(null);
    } catch (err) {
      setError(messageFor(err));
    }
  }

  function startOver() {
    setResult(null);
    setCopied(false);
  }

  const shownLatex =
    result && (version === 'original' ? result.originalLatex : result.convertedLatex);

  async function copyLatex() {
    if (!shownLatex) return;
    await navigator.clipboard.writeText(shownLatex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Resume Converter</p>
              <p className="text-xs text-slate-500">
                Switch between two LaTeX resume templates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Your resume isn&apos;t saved
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {!result ? (
          <EditView
            latex={latex}
            onChange={handleInputChange}
            onAnalyze={handleAnalyze}
            onLoadSample={loadSample}
            analysis={analysis}
            target={target}
            onTargetChange={setTarget}
            onConvert={handleConvert}
            error={error}
          />
        ) : (
          <ResultView
            result={result}
            version={version}
            view={view}
            copied={copied}
            shownLatex={shownLatex || ''}
            onVersionChange={setVersion}
            onViewChange={setView}
            onCopy={copyLatex}
            onStartOver={startOver}
          />
        )}
      </main>
    </div>
  );
}

interface EditViewProps {
  latex: string;
  onChange: (v: string) => void;
  onAnalyze: () => void;
  onLoadSample: (t: TemplateId) => void;
  analysis: AnalyzeResult | null;
  target: TemplateId | null;
  onTargetChange: (t: TemplateId) => void;
  onConvert: () => void;
  error: string | null;
}

function EditView({
  latex,
  onChange,
  onAnalyze,
  onLoadSample,
  analysis,
  target,
  onTargetChange,
  onConvert,
  error,
}: EditViewProps) {
  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">
          Paste your LaTeX resume
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Paste the full source of a Jake&apos;s Resume or Engineering Resume document.
          We detect the format, rebuild it in the other template, and give you clean
          LaTeX to copy.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            LaTeX source
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Try a sample:</span>
            {TEMPLATE_ORDER.map((t) => (
              <button
                key={t}
                onClick={() => onLoadSample(t)}
                className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {TEMPLATE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
        <Textarea
          value={latex}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          placeholder={'\\documentclass{article}\n\\begin{document}\n...\n\\end{document}'}
          className="min-h-[340px] resize-y rounded-none border-0 bg-slate-950 font-mono text-[13px] leading-relaxed text-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!analysis ? (
        <Button
          onClick={onAnalyze}
          disabled={latex.trim().length === 0}
          size="lg"
          className="gap-2"
        >
          <Wand2 className="h-4 w-4" />
          Analyze resume
        </Button>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-slate-500">Detected format:</span>
            <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
              {TEMPLATE_LABELS[analysis.template]}
            </span>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm text-slate-500">Convert to:</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {TEMPLATE_ORDER.map((t) => {
                const selected = target === t;
                return (
                  <button
                    key={t}
                    onClick={() => onTargetChange(t)}
                    className={cn(
                      'flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition',
                      selected
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <span>{TEMPLATE_LABELS[t]}</span>
                    {t === analysis.template && (
                      <span
                        className={cn(
                          'text-xs',
                          selected ? 'text-slate-300' : 'text-slate-400'
                        )}
                      >
                        same format
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={onConvert} size="lg" className="mt-5 gap-2">
            Convert
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface ResultViewProps {
  result: ConvertResult;
  version: 'original' | 'converted';
  view: 'latex' | 'pdf';
  copied: boolean;
  shownLatex: string;
  onVersionChange: (v: 'original' | 'converted') => void;
  onViewChange: (v: 'latex' | 'pdf') => void;
  onCopy: () => void;
  onStartOver: () => void;
}

function ResultView({
  result,
  version,
  view,
  copied,
  shownLatex,
  onVersionChange,
  onViewChange,
  onCopy,
  onStartOver,
}: ResultViewProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
            {TEMPLATE_LABELS[result.sourceTemplate]}
          </span>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <span className="rounded-md bg-slate-900 px-2.5 py-1 font-medium text-white">
            {TEMPLATE_LABELS[result.targetTemplate]}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onStartOver} className="gap-2">
          <RotateCcw className="h-3.5 w-3.5" />
          Convert another
        </Button>
      </div>

      {result.warnings.length > 0 && (
        <div className="space-y-2">
          {result.warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>{w}</p>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              options={[
                { value: 'original', label: 'Original' },
                { value: 'converted', label: 'Converted' },
              ]}
              value={version}
              onChange={(v) => onVersionChange(v as 'original' | 'converted')}
            />
            <Segmented
              options={[
                { value: 'latex', label: 'LaTeX' },
                { value: 'pdf', label: 'PDF' },
              ]}
              value={view}
              onChange={(v) => onViewChange(v as 'latex' | 'pdf')}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openInOverleaf(shownLatex)}
              className="gap-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in Overleaf
            </Button>
            <Button size="sm" onClick={onCopy} className="gap-2">
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy LaTeX
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="h-[68vh]">
          {view === 'latex' ? (
            <CodeViewer code={shownLatex} />
          ) : (
            <PdfPanel latex={shownLatex} />
          )}
        </div>
      </div>
    </div>
  );
}

function PdfPanel({ latex }: { latex: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
        <FileText className="h-6 w-6 text-slate-500" />
      </div>
      <div className="max-w-md">
        <h3 className="text-base font-semibold text-slate-800">
          Preview the PDF in Overleaf
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          This converter turns your resume into clean LaTeX but does not compile
          PDFs itself. Open the document in Overleaf to compile it, see the finished
          page, and keep editing.
        </p>
      </div>
      <Button onClick={() => openInOverleaf(latex)} className="gap-2">
        <ExternalLink className="h-4 w-4" />
        Open in Overleaf
      </Button>
    </div>
  );
}

interface SegmentedProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}

function Segmented({ options, value, onChange }: SegmentedProps) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition',
            value === opt.value
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
