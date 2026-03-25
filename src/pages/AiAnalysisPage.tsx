import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Lock, Sparkles, Loader2, ArrowLeft, Brain, CheckCircle2,
  AlertCircle, ZapOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  analyzeResumeById, analyzeResumePdf, getAiAnalysisById, getAiAnalysisHistory,
  type AiAnalysisResult, type AiAnalysisHistoryItem,
} from '@/services/aiAnalysisService';
import { getMySubscriptionStatus } from '@/services/subscriptionService';
import { loadSession } from '@/services/authService';

type PageMode = 'gate' | 'upload' | 'results';

export default function AiAnalysisPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const session = loadSession();

  const [mode, setMode] = useState<PageMode>('upload');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<AiAnalysisResult | null>(null);
  const [history, setHistory] = useState<AiAnalysisHistoryItem[]>([]);
  const [error, setError] = useState<string>('');
  const [loadingHistoryId, setLoadingHistoryId] = useState<number | null>(null);

  // ── Initialize: check subscription and mode ──
  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }

    (async () => {
      try {
        const status = await getMySubscriptionStatus(session.accessToken);
        if (!status.aiAnalysisEnabled) {
          setMode('gate');
          setLoading(false);
          return;
        }

        // Check if navigated from ResumeEditPage with result
        if (location.state?.result) {
          setResult(location.state.result);
          setMode('results');
        } else {
          setMode('upload');
          // Fetch history
          const hist = await getAiAnalysisHistory(session.accessToken);
          setHistory(hist);
        }
      } catch (err) {
        console.error('Failed to initialize AI Analysis page:', err);
        setError(t('aiAnalysis.loadError'));
      } finally {
        setLoading(false);
      }
    })();
  }, [session, location.state, navigate]);

  const handleFileSelect = async (file: File) => {
    if (!session) return;

    // Validate: PDF only, max 10MB
    if (file.type !== 'application/pdf') {
      setError(t('aiAnalysis.dropzoneMax'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t('aiAnalysis.dropzoneMax'));
      return;
    }

    setError('');
    setUploading(true);
    try {
      const analysisResult = await analyzeResumePdf(file, session.accessToken, i18n.language);
      setResult(analysisResult);
      setMode('results');
    } catch (err: any) {
      setError(err.message || t('aiAnalysis.loadError'));
    } finally {
      setUploading(false);
    }
  };

  const handleHistoryClick = async (item: AiAnalysisHistoryItem) => {
    if (!session) return;
    setLoadingHistoryId(item.id);
    try {
      const fullResult = await getAiAnalysisById(item.id, session.accessToken);
      setResult(fullResult);
      setMode('results');
    } catch {
      setError(t('aiAnalysis.loadError'));
    } finally {
      setLoadingHistoryId(null);
    }
  };

  const handleRunNewAnalysis = () => {
    setResult(null);
    setMode('upload');
    setError('');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/resumes')}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Brain className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">{t('aiAnalysis.pageTitle')}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {mode === 'gate' && <SubscriptionGateView navigate={navigate} t={t} />}
        {mode === 'upload' && (
          <UploadView
            onFileSelect={handleFileSelect}
            uploading={uploading}
            history={history}
            onHistoryClick={handleHistoryClick}
            loadingHistoryId={loadingHistoryId}
            error={error}
            t={t}
          />
        )}
        {mode === 'results' && result && (
          <ResultsView result={result} onNewAnalysis={handleRunNewAnalysis} t={t} />
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

interface ViewProps {
  t: any;
}

function SubscriptionGateView({ navigate, t }: { navigate: any; t: any }) {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Lock className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{t('aiAnalysis.gateTitle')}</h2>
          <p className="text-muted-foreground text-sm">
            {t('aiAnalysis.gateDesc')}
          </p>
        </div>
        <Button
          onClick={() => navigate('/settings/subscription')}
          className="w-full"
        >
          {t('aiAnalysis.upgradeNow')}
        </Button>
      </div>
    </div>
  );
}

interface UploadViewProps extends ViewProps {
  onFileSelect: (file: File) => void;
  uploading: boolean;
  history: AiAnalysisHistoryItem[];
  onHistoryClick: (item: AiAnalysisHistoryItem) => void;
  loadingHistoryId: number | null;
  error: string;
}

function UploadView({
  onFileSelect, uploading, history, onHistoryClick, loadingHistoryId, error, t,
}: UploadViewProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* PDF Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/30 hover:border-muted-foreground/50'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          disabled={uploading}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">
              {t('aiAnalysis.analyzing')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Brain className="h-12 w-12 text-muted-foreground/60 mx-auto" />
            <div>
              <p className="font-medium text-foreground">{t('aiAnalysis.dropzone')}</p>
              <p className="text-sm text-muted-foreground">{t('aiAnalysis.dropzoneOr')}</p>
            </div>
            <p className="text-xs text-muted-foreground">{t('aiAnalysis.dropzoneMax')}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* History List */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('aiAnalysis.history')}
          </h2>
          <div className="space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onHistoryClick(item)}
                disabled={loadingHistoryId !== null}
                className="w-full text-left p-4 rounded-lg border border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/30 transition-colors group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {item.resumeTitle || t('aiAnalysis.pdfUpload')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center gap-3">
                    {loadingHistoryId === item.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    {item.totalScore !== null && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {item.totalScore}
                        </p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ResultsViewProps extends ViewProps {
  result: AiAnalysisResult;
  onNewAnalysis: () => void;
}

function ResultsView({ result, onNewAnalysis, t }: ResultsViewProps) {
  const getTotalScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getTotalScoreBg = (score: number | null) => {
    if (score === null) return 'bg-muted';
    if (score >= 75) return 'bg-green-100 dark:bg-green-950';
    if (score >= 50) return 'bg-amber-100 dark:bg-amber-950';
    return 'bg-red-100 dark:bg-red-950';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header with "Run New Analysis" button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('aiAnalysis.resultsTitle')}</h2>
          <p className="text-sm text-muted-foreground">
            {result.resumeTitle || t('aiAnalysis.pdfUpload')} •{' '}
            {new Date(result.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onNewAnalysis}
          className="text-primary hover:underline text-sm font-medium"
        >
          {t('aiAnalysis.newAnalysis')}
        </button>
      </div>

      {/* Total Score Circle */}
      <div className="flex justify-center">
        <div
          className={`relative w-32 h-32 rounded-full flex items-center justify-center ${getTotalScoreBg(
            result.totalScore,
          )}`}
        >
          <div className="text-center">
            <div className={`text-4xl font-bold ${getTotalScoreColor(result.totalScore)}`}>
              {result.totalScore ?? '—'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{t('aiAnalysis.overallScore')}</div>
          </div>
        </div>
      </div>

      {/* Component Scores (bars) */}
      {(result.structureScore !== null ||
        result.grammarScore !== null ||
        result.impactScore !== null) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {result.structureScore !== null && (
            <ScoreBar
              label={t('aiAnalysis.structure')}
              score={result.structureScore}
              color="bg-blue-500"
            />
          )}
          {result.grammarScore !== null && (
            <ScoreBar label={t('aiAnalysis.grammar')} score={result.grammarScore} color="bg-emerald-500" />
          )}
          {result.impactScore !== null && (
            <ScoreBar label={t('aiAnalysis.impact')} score={result.impactScore} color="bg-purple-500" />
          )}
        </div>
      )}

      {/* Suggestions */}
      {result.suggestions && result.suggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            {t('aiAnalysis.suggestions')}
          </h3>
          <ol className="space-y-2">
            {result.suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                className="p-3 bg-muted/50 rounded-lg text-sm flex gap-3"
              >
                <span className="font-medium text-muted-foreground flex-shrink-0">
                  {idx + 1}.
                </span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Gap Skills */}
      {result.gapSkills && result.gapSkills.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <ZapOff className="h-5 w-5 text-indigo-500" />
            {t('aiAnalysis.skillsToLearn')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.gapSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-100 text-sm font-medium rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {(result.modelUsed || result.tokensUsed) && (
        <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
          {result.modelUsed && <p>{t('aiAnalysis.model')}: {result.modelUsed}</p>}
          {result.tokensUsed && <p>{t('aiAnalysis.tokensUsed')}: {result.tokensUsed}</p>}
        </div>
      )}

      {/* Action button */}
      <div>
        <Button onClick={onNewAnalysis} variant="outline" className="w-full sm:w-auto">
          {t('aiAnalysis.analyzeAnother')}
        </Button>
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm font-bold">{score}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
