import { useEffect, useRef } from 'react';
import { X, Sparkles, Loader2, RefreshCw, AlertCircle, Lightbulb, Zap } from 'lucide-react';
import type { AiAnalysisResult } from '@/services/aiService';

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreArc({
  score,
  label,
  color,
}: {
  score: number | null;
  label: string;
  color: string;
}) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = score != null ? Math.max(0, Math.min(100, score)) : 0;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor"
          strokeWidth="5" className="text-muted/20" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color}
          strokeWidth="5" strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }} />
        <text x="36" y="40" textAnchor="middle" fontSize="15" fontWeight="700"
          fill="currentColor" className="fill-foreground"
          style={{ transform: 'rotate(90deg)', transformOrigin: '36px 36px' }}>
          {score ?? '—'}
        </text>
      </svg>
      <span className="text-[11px] text-muted-foreground font-medium text-center leading-tight">{label}</span>
    </div>
  );
}

// ── Score color helper ────────────────────────────────────────────────────────
function scoreColor(s: number | null): string {
  if (s == null) return '#94a3b8';
  if (s >= 80) return '#22c55e';
  if (s >= 60) return '#f59e0b';
  return '#ef4444';
}

// ── Panel ─────────────────────────────────────────────────────────────────────
interface AiAnalysisPanelProps {
  open: boolean;
  onClose: () => void;
  onRerun: () => void;
  analyzing: boolean;
  result: AiAnalysisResult | null;
  error: string | null;
}

export function AiAnalysisPanel({
  open, onClose, onRerun, analyzing, result, error,
}: AiAnalysisPanelProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
      />

      {/* Drawer — slides in from right */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] bg-card border-l shadow-2xl flex flex-col transition-transform duration-300"
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">AI Resume Analysis</h2>
              <p className="text-[11px] text-muted-foreground">Powered by Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {result && !analyzing && (
              <button
                onClick={onRerun}
                className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Re-run analysis"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Loading */}
          {analyzing && (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Sparkles className="h-7 w-7 text-white animate-pulse" />
                </div>
                <Loader2 className="absolute -inset-1 h-16 w-16 animate-spin text-violet-400 opacity-60" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">Analyzing your resume…</p>
                <p className="text-xs text-muted-foreground mt-1">Gemini is reading your sections</p>
              </div>
              {/* Skeleton dots */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-violet-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {!analyzing && error && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="h-12 w-12 rounded-2xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <p className="font-medium text-sm text-rose-600">Analysis failed</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">{error}</p>
              </div>
              <button
                onClick={onRerun}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:underline"
              >
                <RefreshCw className="h-3 w-3" /> Try again
              </button>
            </div>
          )}

          {/* Results */}
          {!analyzing && result && (
            <>
              {/* Score grid */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Scores</p>
                <div className="grid grid-cols-4 gap-2">
                  <ScoreArc score={result.totalScore}     label="Overall"   color={scoreColor(result.totalScore)} />
                  <ScoreArc score={result.structureScore} label="Structure"  color={scoreColor(result.structureScore)} />
                  <ScoreArc score={result.grammarScore}   label="Grammar"    color={scoreColor(result.grammarScore)} />
                  <ScoreArc score={result.impactScore}    label="Impact"     color={scoreColor(result.impactScore)} />
                </div>

                {/* Total score bar */}
                {result.totalScore != null && (
                  <div className="mt-4 p-3.5 rounded-xl bg-muted/40 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">ATS Score</span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: scoreColor(result.totalScore) }}
                      >
                        {result.totalScore}/100
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${result.totalScore}%`,
                          background: `linear-gradient(90deg, ${scoreColor(result.totalScore)}, ${scoreColor(result.totalScore)}cc)`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      {result.totalScore >= 80
                        ? '🎉 Excellent! Your resume is well-optimized.'
                        : result.totalScore >= 60
                        ? '👍 Good. A few improvements can boost your score.'
                        : '⚠️ Needs work. Follow the suggestions below.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Suggestions
                  </p>
                  <div className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-3 rounded-xl border bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-800/30"
                      >
                        <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gap skills */}
              {result.gapSkills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Missing Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.gapSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border border-violet-200 dark:border-violet-800/40 bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300"
                      >
                        <Zap className="h-2.5 w-2.5" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta */}
              <div className="pt-1 border-t">
                <p className="text-[10px] text-muted-foreground">
                  Model: {result.modelUsed ?? 'gemini-1.5-flash'}
                  {result.tokensUsed ? ` · ${result.tokensUsed} tokens` : ''}
                  {' · '}
                  {new Date(result.createdAt).toLocaleString()}
                </p>
              </div>
            </>
          )}

          {/* Empty — not yet run */}
          {!analyzing && !result && !error && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-violet-500" />
              </div>
              <div>
                <p className="font-medium text-sm">Ready to analyze</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                  Click "Run Analysis" to get your ATS score, grammar check, and improvement tips.
                </p>
              </div>
              <button
                onClick={onRerun}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-semibold shadow hover:shadow-md hover:shadow-violet-500/30 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" /> Run Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
