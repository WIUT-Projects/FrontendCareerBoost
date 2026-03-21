import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Eye, Edit3, Loader2, X, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { CoverImageUpload } from '@/components/blog/CoverImageUpload';
import { resolveMediaUrl } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import {
  getArticleById,
  getArticleCategories,
  getArticleTags,
  updateArticle,
  publishArticle,
  deleteArticle,
  type ArticleCategoryDto,
  type ArticleTagDto,
  type UpdateArticleRequest,
} from '@/services/blogService';

export default function AdminBlogEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { t, i18n } = useTranslation();

  const [categories, setCategories] = useState<ArticleCategoryDto[]>([]);
  const [tags, setTags] = useState<ArticleTagDto[]>([]);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articleStatus, setArticleStatus] = useState('draft');

  const [form, setForm] = useState<UpdateArticleRequest>({
    title: '',
    slug: '',
    coverUrl: '',
    categoryId: undefined,
    body: '',
    status: 'draft',
    readingTime: undefined,
    tagIds: [],
  });

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getArticleById(Number(id)),
      getArticleCategories(),
      getArticleTags(),
    ]).then(([article, cats, tagList]) => {
      setCategories(cats?.items ?? []);
      setTags(tagList?.items ?? []);
      setArticleStatus(article.status);
      setForm({
        title: article.title,
        slug: article.slug,
        coverUrl: article.coverUrl ?? '',
        categoryId: article.categoryId || undefined,
        body: article.body ?? '',
        status: article.status as UpdateArticleRequest['status'],
        readingTime: article.readingTime || undefined,
        tagIds: article.tags.map((t) => t.id),
      });
    }).catch(() => setError('Maqola yuklanmadi')).finally(() => setLoading(false));
  }, [id]);

  function set<K extends keyof UpdateArticleRequest>(key: K, value: UpdateArticleRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(tagId: number) {
    set('tagIds', form.tagIds.includes(tagId)
      ? form.tagIds.filter((t) => t !== tagId)
      : [...form.tagIds, tagId]);
  }

  function getCategoryName(cat: ArticleCategoryDto): string {
    const lang = i18n.language;
    if (lang === 'uz' && cat.nameUz) return cat.nameUz;
    if (lang === 'ru' && cat.nameRu) return cat.nameRu;
    if (lang === 'en' && cat.nameEn) return cat.nameEn;
    return cat.name;
  }

  async function handleSave() {
    if (!session || !id) return;
    if (!form.title.trim()) { setError(t('blog.titleRequired')); return; }
    setSaving(true);
    setError(null);
    try {
      await updateArticle(session.access_token, Number(id), {
        ...form,
        coverUrl: form.coverUrl || undefined,
        readingTime: form.readingTime || undefined,
        categoryId: form.categoryId || undefined,
      });
    } catch {
      setError(t('blog.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!session || !id) return;
    setSaving(true);
    try {
      await handleSave();
      await publishArticle(session.access_token, Number(id));
      setArticleStatus('published');
      set('status', 'published');
    } catch {
      setError(t('blog.publishError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!session || !id) return;
    await deleteArticle(session.access_token, Number(id));
    navigate('/admin');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            {t('blog.back')}
          </Button>
          <span className="font-display font-semibold">{t('blog.editArticleTitle')}</span>
          {articleStatus === 'published' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium">
              {t('blog.published')}
            </span>
          )}
          {articleStatus === 'draft' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 font-medium">
              {t('blog.draft')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="outline" />
          <Button variant="outline" size="sm" onClick={() => setPreview((p) => !p)} className="gap-2">
            {preview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {preview ? t('blog.editMode') : t('blog.preview')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('blog.save')}
          </Button>
          {articleStatus !== 'published' && (
            <Button size="sm" onClick={handlePublish} disabled={saving} className="gap-2">
              {t('blog.publish')}
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="h-4 w-4" />
                {t('blog.delete')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('blog.deleteConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>{t('blog.deleteConfirmDesc')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('blog.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t('blog.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <div className="flex h-[calc(100vh-65px)]">
        {/* Editor / Preview */}
        <div className="flex-1 overflow-auto p-6">
          {preview ? (
            <div className="max-w-3xl mx-auto">
              {form.coverUrl && (
                <img src={resolveMediaUrl(form.coverUrl)} alt="" className="w-full h-56 object-cover rounded-2xl mb-6" />
              )}
              <h1 className="font-display text-3xl font-bold mb-4">{form.title || t('blog.titlePlaceholder')}</h1>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {form.body || ''}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              <Textarea
                placeholder={t('blog.contentPlaceholder')}
                value={form.body ?? ''}
                onChange={(e) => set('body', e.target.value)}
                className="min-h-[600px] resize-none font-mono text-sm"
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-80 border-l overflow-auto p-5 space-y-5 shrink-0">
          <div className="space-y-2">
            <Label>{t('blog.titleLabel')} *</Label>
            <Input
              placeholder={t('blog.titlePlaceholder')}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              placeholder={t('blog.slugPlaceholder')}
              value={form.slug ?? ''}
              onChange={(e) => set('slug', e.target.value)}
            />
          </div>

          <CoverImageUpload
            value={form.coverUrl}
            onChange={(url) => set('coverUrl', url)}
            label={t('blog.coverUrl')}
            session={session}
            disabled={saving}
          />

          <div className="space-y-2">
            <Label>{t('blog.category')}</Label>
            <Select
              value={form.categoryId ? String(form.categoryId) : ''}
              onValueChange={(v) => set('categoryId', v ? Number(v) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('blog.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={`${c.id}-${i18n.language}`} value={String(c.id)}>
                    {getCategoryName(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('blog.tags')}</Label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const selected = form.tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:border-primary'
                    }`}
                  >
                    {selected && <X className="inline h-3 w-3 mr-1" />}
                    #{tag.name}
                  </button>
                );
              })}
            </div>
            {form.tagIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {t('blog.tagsSelected', { count: form.tagIds.length })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('blog.status')}</Label>
            <Select
              value={form.status}
              onValueChange={(v) => set('status', v as UpdateArticleRequest['status'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{t('blog.draft')}</SelectItem>
                <SelectItem value="published">{t('blog.published')}</SelectItem>
                <SelectItem value="archived">{t('blog.archived')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('blog.readingTime')}</Label>
            <Input
              type="number"
              min={1}
              placeholder={t('blog.readingTimeAuto')}
              value={form.readingTime ?? ''}
              onChange={(e) => set('readingTime', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          {id && (
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const article = { slug: form.slug };
                  if (article.slug) navigate(`/blog/${article.slug}`);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                {t('blog.viewInBlog')}
              </Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
