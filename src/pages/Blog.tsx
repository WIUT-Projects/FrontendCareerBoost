import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Heart, MessageSquare, ArrowLeft, Loader2, Plus, Pencil, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/shared/AuthModal';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { resolveMediaUrl } from '@/lib/utils';
import {
  getArticles,
  getArticleCategories,
  type ArticleDto,
  type ArticleCategoryDto,
} from '@/services/blogService';

export default function BlogPage() {
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const isAdmin = profile?.role === 'admin';
  const [authModal, setAuthModal] = useState(false);
  const [articles, setArticles] = useState<ArticleDto[]>([]);
  const [categories, setCategories] = useState<ArticleCategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const PAGE_SIZE = 8;

  useEffect(() => {
    getArticleCategories()
      .then((r) => setCategories(r?.items ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
    setArticles([]);
    setLoading(true);
    setError(null);
    getArticles({ status: 'published', categoryId: selectedCategory ?? undefined, page: 1, pageSize: PAGE_SIZE })
      .then((r) => {
        setArticles(r.items);
        setHasMore(r.page * r.pageSize < r.totalCount);
      })
      .catch(() => setError(t('blog.loadError')))
      .finally(() => setLoading(false));
  }, [selectedCategory, t]);

  async function loadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const r = await getArticles({ status: 'published', categoryId: selectedCategory ?? undefined, page: nextPage, pageSize: PAGE_SIZE });
      setArticles((prev) => [...prev, ...r.items]);
      setHasMore(nextPage * r.pageSize < r.totalCount);
      setPage(nextPage);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  }

  function formatDate(iso: string) {
    const locale =
      i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'en' ? 'en-US' : 'uz-UZ';
    return new Date(iso).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function getCategoryName(cat: ArticleCategoryDto): string {
    const lang = i18n.language;
    if (lang === 'uz' && cat.nameUz) return cat.nameUz;
    if (lang === 'ru' && cat.nameRu) return cat.nameRu;
    if (lang === 'en' && cat.nameEn) return cat.nameEn;
    return cat.name;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top bar ── */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Left */}
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-1.5 text-muted-foreground hover:text-foreground shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t('blog.back')}</span>
            </Button>
            <div className="flex items-center gap-1.5 min-w-0">
              <BookOpen className="h-4 w-4 text-primary shrink-0" />
              <span className="font-display font-semibold truncate">{t('nav.blog')}</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher variant="outline" />
            {isAuthenticated ? (
              <Button size="sm" onClick={() => navigate('/blog/new')} className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t('blog.newArticle')}</span>
                <span className="sm:hidden">+</span>
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setAuthModal(true)} className="gap-1.5">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">{t('blog.signIn')}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">{t('blog.title')}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{t('blog.subtitle')}</p>
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              {t('blog.all')}
            </Button>
            {categories.map((cat) => (
              <Button
                key={`${cat.id}-${i18n.language}`}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {getCategoryName(cat)}
              </Button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-24 text-muted-foreground">{error}</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">{t('blog.noArticles')}</div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => navigate(`/blog/${article.slug}`)}
                  onEdit={isAdmin ? () => navigate(`/admin/blog/${article.id}`) : undefined}
                  formatDate={formatDate}
                  minutesLabel={t('blog.minutes')}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="gap-2 px-8"
                >
                  {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t('blog.loadMore')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <AuthModal
        open={authModal}
        onClose={() => setAuthModal(false)}
        reason={t('blog.authModalReason')}
      />
    </div>
  );
}

// ─── Article Card ──────────────────────────────────────────────────────────────

interface CardProps {
  article: ArticleDto;
  onClick: () => void;
  onEdit?: () => void;
  formatDate: (iso: string) => string;
  minutesLabel: string;
}

function ArticleCard({ article, onClick, onEdit, formatDate, minutesLabel }: CardProps) {
  return (
    <div className="relative rounded-2xl border bg-card hover:shadow-md transition-all duration-200 overflow-hidden group flex flex-col">
      {onEdit && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm border text-muted-foreground hover:text-foreground hover:bg-background transition-all opacity-0 group-hover:opacity-100"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}

      <button onClick={onClick} className="text-left flex flex-col flex-1 w-full">
        {/* Cover */}
        {article.coverUrl ? (
          <div className="h-44 overflow-hidden bg-muted shrink-0">
            <img
              src={resolveMediaUrl(article.coverUrl)}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        ) : (
          <div className="h-44 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="h-10 w-10 text-primary/30" />
          </div>
        )}

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs truncate max-w-[120px]">
              {article.categoryName}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3" />
              {article.readingTime} {minutesLabel}
            </span>
          </div>

          {/* Title */}
          <h2 className="font-display font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h2>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
            {stripMarkdown(article.body)}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />{article.likesCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />{article.commentsCount}
              </span>
            </div>
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\n/g, ' ')
    .slice(0, 200);
}
