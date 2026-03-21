import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import { AuthModal } from '@/components/shared/AuthModal';
import { resolveMediaUrl } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import {
  ArrowLeft,
  Clock,
  Heart,
  MessageSquare,
  Loader2,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import {
  getArticleBySlug,
  getComments,
  postComment,
  getLikesCount,
  likeArticle,
  unlikeArticle,
  type ArticleDto,
  type ArticleCommentDto,
} from '@/services/blogService';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { t, i18n } = useTranslation();

  const [article, setArticle] = useState<ArticleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [comments, setComments] = useState<ArticleCommentDto[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const commentRef = useRef<HTMLTextAreaElement>(null);

  // Load article
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getArticleBySlug(slug)
      .then((a) => {
        setArticle(a);
        setLikesCount(a.likesCount);
        loadComments(a.id);
        loadLikesCount(a.id);
      })
      .catch(() => setError('Maqola topilmadi.'))
      .finally(() => setLoading(false));
  }, [slug]);

  function loadLikesCount(id: number) {
    getLikesCount(id).then(setLikesCount).catch(() => {});
  }

  function loadComments(id: number) {
    setCommentsLoading(true);
    getComments(id)
      .then((r) => setComments(r.items))
      .catch(() => {})
      .finally(() => setCommentsLoading(false));
  }

  async function handleLike() {
    if (!article || !session) return;
    setLikeLoading(true);
    try {
      if (liked) {
        await unlikeArticle(session.access_token, article.id);
        setLiked(false);
        setLikesCount((n) => Math.max(0, n - 1));
      } else {
        await likeArticle(session.access_token, article.id);
        setLiked(true);
        setLikesCount((n) => n + 1);
      }
    } catch {
      // ignore
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleComment() {
    if (!article || !session || !commentBody.trim()) return;
    setSubmitting(true);
    try {
      const newComment = await postComment(session.access_token, article.id, commentBody.trim());
      setComments((prev) => [newComment, ...prev]);
      setCommentBody('');
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(iso: string) {
    const locale = i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'en' ? 'en-US' : 'uz-UZ';
    return new Date(iso).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">{error ?? 'Maqola topilmadi.'}</p>
        <Button variant="outline" onClick={() => navigate('/blog')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Blogga qaytish
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar — sticky */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/blog')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('blog.backToBlog')}
          </Button>
          <LanguageSwitcher variant="outline" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Cover */}
        {article.coverUrl && (
          <div className="rounded-2xl overflow-hidden mb-8 h-56 bg-muted">
            <img
              src={resolveMediaUrl(article.coverUrl)}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="secondary">{article.categoryName}</Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {article.readingTime} {t('blog.minutes')}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatDate(article.publishedAt || article.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl font-bold mb-4 leading-tight">{article.title}</h1>

        {/* Author */}
        <p className="text-sm text-muted-foreground mb-6">
          {t('blog.author')}: <span className="font-medium text-foreground">{article.authorName}</span>
        </p>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-8">
            {article.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-10">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.body ?? ''}
          </ReactMarkdown>
        </div>

        {/* Like / Comment stats */}
        <div className="flex items-center gap-4 my-10">
          {/* Like button */}
          <button
            onClick={() => session ? handleLike() : setAuthModal(true)}
            disabled={likeLoading}
            className={`group relative flex items-center gap-3 px-6 py-3 rounded-2xl border-2 font-medium text-sm transition-all duration-200 select-none
              ${liked
                ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)]'
                : 'border-border bg-card text-muted-foreground hover:border-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]'
              }
              disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {likeLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Heart
                className={`h-5 w-5 transition-all duration-200 ${
                  liked ? 'fill-red-500 scale-110' : 'group-hover:scale-110'
                }`}
              />
            )}
            <span className="tabular-nums">{likesCount}</span>
            <span>{liked ? t('blog.liked') : t('blog.like')}</span>
          </button>

          {/* Comment scroll */}
          <button
            onClick={() => session ? commentRef.current?.focus() : setAuthModal(true)}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl border-2 border-border bg-card text-muted-foreground text-sm font-medium hover:border-primary/40 hover:text-foreground hover:bg-accent transition-all duration-200 select-none"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="tabular-nums">{comments.length}</span>
            <span>{t('blog.commentBtn')}</span>
          </button>
        </div>

        {/* Comments section */}
        <section>
          <h2 className="font-display font-semibold text-xl mb-6">{t('blog.comments')}</h2>

          {/* Comment form */}
          {session ? (
            <div className="flex flex-col gap-2 mb-8">
              <Textarea
                ref={commentRef}
                placeholder={t('blog.leaveComment')}
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleComment}
                  disabled={submitting || !commentBody.trim()}
                  className="gap-2"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {t('blog.submitComment')}
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAuthModal(true)}
              className="w-full mb-8 p-4 rounded-xl border border-dashed text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors text-center"
            >
              {t('blog.loginToComment')}
            </button>
          )}

          {/* Comment list */}
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t('blog.noComments')}</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((comment) => (
                <li key={comment.id} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{comment.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <AuthModal
        open={authModal}
        onClose={() => setAuthModal(false)}
        reason="Yoqtirish yoki izoh qoldirish uchun tizimga kirgan bo'lishingiz kerak."
      />
    </div>
  );
}
