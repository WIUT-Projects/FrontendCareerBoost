import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, Loader2, TrendingUp, Zap, DollarSign, Lightbulb, Users } from 'lucide-react';
import { getAiUsageStats, type AdminAiUsageStats, type ModelStats } from '@/services/adminService';
import { loadSession } from '@/services/authService';

export default function AdminAiUsagePage() {
  const { t } = useTranslation();
  const session = loadSession();
  const [stats, setStats] = useState<AdminAiUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;

    (async () => {
      try {
        const data = await getAiUsageStats(session.accessToken);
        setStats(data);
      } catch (err: any) {
        setError(t('admin.aiUsage.loadError'));
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 p-6">
        <p className="text-destructive text-sm font-medium">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 p-6">
        <p className="text-muted-foreground">{t('admin.aiUsage.noData')}</p>
      </div>
    );
  }

  const avgCostPerAnalysis = stats.totalAnalyses > 0
    ? (stats.totalCostUsd / stats.totalAnalyses).toFixed(4)
    : '0.0000';

  const totalTokens = stats.totalTokensInput + stats.totalTokensOutput;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background px-6 py-4 flex items-center gap-3">
        <Brain className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">{t('admin.aiUsage.title')}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Analyses */}
            <div className="rounded-lg border bg-card p-6 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">{t('admin.aiUsage.totalAnalyses')}</label>
                <TrendingUp className="h-4 w-4 text-primary/60" />
              </div>
              <div className="text-3xl font-bold">{stats.totalAnalyses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{t('admin.aiUsage.allTimeDesc')}</p>
            </div>

            {/* Total Tokens */}
            <div className="rounded-lg border bg-card p-6 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">{t('admin.aiUsage.totalTokens')}</label>
                <Zap className="h-4 w-4 text-yellow-500/60" />
              </div>
              <div className="text-3xl font-bold">
                {(totalTokens / 1_000_000).toFixed(2)}M
              </div>
              <p className="text-xs text-muted-foreground">
                {t('admin.aiUsage.tokenBreakdown', {
                  input: (stats.totalTokensInput / 1_000_000).toFixed(2),
                  output: (stats.totalTokensOutput / 1_000_000).toFixed(2),
                })}
              </p>
            </div>

            {/* Total Cost */}
            <div className="rounded-lg border bg-card p-6 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">{t('admin.aiUsage.totalCost')}</label>
                <DollarSign className="h-4 w-4 text-green-500/60" />
              </div>
              <div className="text-3xl font-bold">${stats.totalCostUsd.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{t('admin.aiUsage.usdCostDesc')}</p>
            </div>

            {/* Avg Cost Per Analysis */}
            <div className="rounded-lg border bg-card p-6 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{t('admin.aiUsage.avgCost')}</label>
              <div className="text-3xl font-bold">${avgCostPerAnalysis}</div>
              <p className="text-xs text-muted-foreground">{t('admin.aiUsage.perAnalysis')}</p>
            </div>
          </div>

          {/* Smart Suggestions */}
          {stats.suggestions && stats.suggestions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Suggestions
              </h2>
              <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 p-4 space-y-2">
                {stats.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Lightbulb className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Model Breakdown */}
          {Object.keys(stats.byModel).length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('admin.aiUsage.modelBreakdown')}</h2>
              <div className="space-y-2">
                {Object.entries(stats.byModel).map(([model, modelStats]) => (
                  <ModelCard key={model} model={model} stats={modelStats} />
                ))}
              </div>
            </div>
          )}

          {/* Top Users */}
          {stats.topUsers && stats.topUsers.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Users className="h-4 w-4" />
                Top Users by AI Cost
              </h2>
              <div className="rounded-lg border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">User</th>
                      <th className="text-right px-4 py-2 font-medium">Analyses</th>
                      <th className="text-right px-4 py-2 font-medium">Tokens</th>
                      <th className="text-right px-4 py-2 font-medium">Cost (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topUsers.map((u) => (
                      <tr key={u.userId} className="border-t">
                        <td className="px-4 py-2">
                          <div className="font-medium">{u.fullName || '—'}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </td>
                        <td className="px-4 py-2 text-right">{u.count.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">{(u.tokens / 1000).toFixed(1)}K</td>
                        <td className="px-4 py-2 text-right font-semibold">${u.costUsd.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Daily Usage Chart */}
          {stats.dailyUsage && stats.dailyUsage.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Daily Usage (last 30 days)</h2>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-end gap-1 h-32">
                  {stats.dailyUsage.map((d) => {
                    const max = Math.max(...stats.dailyUsage.map(x => x.tokens));
                    const h = max > 0 ? (d.tokens / max) * 100 : 0;
                    return (
                      <div
                        key={d.date}
                        className="flex-1 bg-primary/70 rounded-sm hover:bg-primary transition-colors"
                        style={{ height: `${Math.max(2, h)}%` }}
                        title={`${d.date}: ${d.count} calls, ${(d.tokens / 1000).toFixed(1)}K tokens, $${d.costUsd.toFixed(4)}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                  <span>{stats.dailyUsage[0]?.date}</span>
                  <span>{stats.dailyUsage.at(-1)?.date}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModelCard({ model, stats }: { model: string; stats: ModelStats }) {
  const { t } = useTranslation();
  const totalTokens = stats.tokensInput + stats.tokensOutput;
  const percentage = Math.round((stats.tokensInput / totalTokens) * 100);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">{model}</h3>
        <span className="text-sm font-bold text-primary">${stats.costUsd.toFixed(4)}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>
          <p className="font-medium text-foreground">{stats.count}</p>
          <p>{t('admin.aiUsage.analyses')}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">{(totalTokens / 1_000_000).toFixed(2)}M</p>
          <p>{t('admin.aiUsage.tokens')}</p>
        </div>
      </div>

      {/* Token ratio bar */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-blue-500" style={{ width: `${percentage}%` }} />
          <div className="h-full bg-emerald-500" style={{ width: `${100 - percentage}%` }} />
        </div>
        <span className="text-muted-foreground min-w-max">
          {t('admin.aiUsage.tokenRatio', { pct: percentage, outPct: 100 - percentage })}
        </span>
      </div>
    </div>
  );
}
