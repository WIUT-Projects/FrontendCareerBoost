import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen, Search, Loader2, Plus, Eye, Pencil, Trash2,
  CheckCircle2, Clock, Archive, ChevronLeft, ChevronRight,
  X, Tag, Calendar, User,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { loadSession } from '@/services/authService';
import type { ArticleDto } from '@/services/blogService';
import { getArticles, publishArticle, deleteArticle } from '@/services/blogService';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; icon: typeof Clock; cls: string }> = {
  published: { label: 'Published', icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200' },
  draft:     { label: 'Draft',     icon: Clock,        cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  archived:  { label: 'Archived',  icon: Archive,      cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const PAGE_SIZE = 15;

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminBlogPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [articles, setArticles]       = useState<ArticleDto[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [actioning, setActioning]     = useState<number | null>(null);
  const [preview, setPreview]         = useState<ArticleDto | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getArticles({
        pageIndex: page,
        pageSize: PAGE_SIZE,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setArticles(data.items ?? []);
      setTotal(data.totalCount ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = articles.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.title.toLowerCase().includes(q) || (a.authorName ?? '').toLowerCase().includes(q);
  });

  const getToken = () => loadSession()?.accessToken ?? '';

  const handlePublish = async (article: ArticleDto) => {
    setActioning(article.id);
    try {
      await publishArticle(getToken(), article.id);
      setArticles((prev) => prev.map((a) => a.id === article.id ? { ...a, status: 'published' } : a));
    } catch (e) {
      console.error(e);
    } finally { setActioning(null); }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteArticle(getToken(), id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setTotal((t) => t - 1);
    } catch (e) {
      console.error(e);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">{t('admin.blog.title')}</h1>
          <span className="ml-1 text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{total}</span>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => navigate('/admin/blog/new')}>
          <Plus className="h-4 w-4" />
          {t('admin.blog.newArticle')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 border-b bg-muted/30 px-6 py-2.5 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder={t('admin.blog.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatus(v as typeof statusFilter); setPage(1); }}>
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue placeholder={t('admin.blog.allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.blog.allStatuses')}</SelectItem>
            <SelectItem value="published">{t('admin.blog.status.published')}</SelectItem>
            <SelectItem value="draft">{t('admin.blog.status.draft')}</SelectItem>
            <SelectItem value="archived">{t('admin.blog.status.archived')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-4 py-2.5 font-medium text-muted-foreground w-10">#</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">{t('admin.blog.table.title')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">{t('admin.blog.table.author')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">{t('admin.blog.table.category')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground w-28">{t('admin.blog.table.status')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground w-20 hidden sm:table-cell">{t('admin.blog.table.views')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground w-24 hidden md:table-cell">{t('admin.blog.table.date')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground w-28 text-right">{t('admin.blog.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-20 text-muted-foreground text-sm">
                    <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    {t('admin.blog.noArticles')}
                  </td>
                </tr>
              ) : filtered.map((article, i) => {
                const cfg = STATUS_CFG[article.status ?? 'draft'] ?? STATUS_CFG.draft;
                const Icon = cfg.icon;
                const isActioning = actioning === article.id;

                return (
                  <tr key={article.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-4 py-3">
                      <button
                        className="text-left hover:text-primary transition-colors group"
                        onClick={() => setPreview(article)}
                      >
                        <div className="font-medium leading-tight line-clamp-1 max-w-xs group-hover:underline underline-offset-2">{article.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{article.slug}</div>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {article.authorName ?? '—'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {article.categoryName
                        ? <Badge variant="secondary" className="text-[11px] font-normal">{article.categoryName}</Badge>
                        : <span className="text-muted-foreground">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
                        <Icon className="h-3 w-3" />
                        {t(`admin.blog.status.${article.status ?? 'draft'}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />{article.viewsCount ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString()
                        : new Date(article.createdAt).toLocaleDateString()
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Publish (only for drafts) */}
                        {article.status === 'draft' && (
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-green-600 hover:bg-green-50"
                            disabled={isActioning}
                            onClick={() => handlePublish(article)}
                            title={t('admin.blog.publish')}
                          >
                            {isActioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                        {/* Edit */}
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7"
                          onClick={() => navigate(`/admin/blog/${article.id}`)}
                          title={t('admin.blog.edit')}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {/* Delete */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('admin.blog.deleteTitle')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('admin.blog.deleteDesc', { title: article.title })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(article.id)}
                              >
                                {t('admin.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 border-t px-6 py-2.5 flex items-center justify-between text-sm">
          <span className="text-muted-foreground text-xs">{t('admin.blog.pagination', { page, totalPages, total })}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Article Preview Modal */}
      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
          {preview && (() => {
            const cfg = STATUS_CFG[preview.status ?? 'draft'] ?? STATUS_CFG.draft;
            const Icon = cfg.icon;
            return (
              <>
                {/* Modal header */}
                <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-lg font-bold leading-snug">{preview.title}</DialogTitle>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{preview.slug}</p>
                    </div>
                    <button
                      onClick={() => setPreview(null)}
                      className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
                      <Icon className="h-3 w-3" />
                      {t(`admin.blog.status.${preview.status ?? 'draft'}`)}
                    </span>
                    {preview.categoryName && (
                      <Badge variant="secondary" className="text-[11px] font-normal">{preview.categoryName}</Badge>
                    )}
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {preview.authorName ?? '—'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {preview.publishedAt
                        ? new Date(preview.publishedAt).toLocaleDateString()
                        : new Date(preview.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {t('admin.blog.views', { count: preview.viewsCount ?? 0 })}
                    </span>
                    {preview.readingTime > 0 && (
                      <span>{t('admin.blog.minRead', { n: preview.readingTime })}</span>
                    )}
                  </div>

                  {/* Tags */}
                  {preview.tags && preview.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {preview.tags.map((tag) => (
                        <span key={tag.id ?? tag.name} className="inline-flex items-center gap-0.5 text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          <Tag className="h-2.5 w-2.5" />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cover image */}
                {preview.coverUrl && (
                  <div className="flex-shrink-0 border-b">
                    <img
                      src={preview.coverUrl}
                      alt={preview.title}
                      className="w-full h-44 object-cover"
                    />
                  </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {preview.body ? (
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: preview.body }}
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm italic">{t('admin.blog.noContent')}</p>
                  )}
                </div>

                {/* Modal footer actions */}
                <div className="flex-shrink-0 border-t px-6 py-3 flex items-center justify-end gap-2">
                  {preview.status === 'draft' && (
                    <Button
                      size="sm"
                      className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => { handlePublish(preview); setPreview(null); }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t('admin.blog.publish')}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => { navigate(`/admin/blog/${preview.id}`); setPreview(null); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t('admin.blog.edit')}
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
