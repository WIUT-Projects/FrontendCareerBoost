import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Edit3, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CoverImageUpload } from '@/components/blog/CoverImageUpload';
import { resolveMediaUrl } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import {
  getArticleCategories,
  getArticleTags,
  createArticle,
  type ArticleCategoryDto,
  type ArticleTagDto,
  type CreateArticleRequest,
} from '@/services/blogService';

export default function AdminBlogNewPage() {
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const { t, i18n } = useTranslation();
  const isAdmin = profile?.role === 'admin';

  const [categories, setCategories] = useState<ArticleCategoryDto[]>([]);
  const [tags, setTags] = useState<ArticleTagDto[]>([]);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateArticleRequest>({
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
    getArticleCategories().then((r) => setCategories(r?.items ?? [])).catch(() => {});
    getArticleTags().then((r) => setTags(r?.items ?? [])).catch(() => {});
  }, []);

  function set<K extends keyof CreateArticleRequest>(key: K, value: CreateArticleRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function onTitleChange(val: string) {
    set('title', val);
    if (!form.slug || form.slug === slugify(form.title)) {
      set('slug', slugify(val));
    }
  }

  function toggleTag(id: number) {
    set('tagIds', form.tagIds.includes(id)
      ? form.tagIds.filter((t) => t !== id)
      : [...form.tagIds, id]);
  }

  function getCategoryName(cat: ArticleCategoryDto): string {
    const lang = i18n.language;
    if (lang === 'uz' && cat.nameUz) return cat.nameUz;
    if (lang === 'ru' && cat.nameRu) return cat.nameRu;
    if (lang === 'en' && cat.nameEn) return cat.nameEn;
    return cat.name;
  }

  async function handleSave(publish = false) {
    if (!session) return;
    if (!form.title.trim()) { setError(t('blog.titleRequired')); return; }
    setSaving(true);
    setError(null);
    try {
      const payload: CreateArticleRequest = {
        ...form,
        slug: form.slug || slugify(form.title),
        status: publish ? 'published' : form.status,
        coverUrl: form.coverUrl || undefined,
        readingTime: form.readingTime || undefined,
        categoryId: form.categoryId || undefined,
      };
      const article = await createArticle(session.access_token, payload);
      if (publish) {
        // Published → blog postini ko'rish
        navigate(`/blog/${article.slug}`);
      } else if (isAdmin) {
        // Admin draft → edit page
        navigate(`/admin/blog/${article.id}`);
      } else {
        // Oddiy user draft → blog ga qaytish
        navigate('/blog');
      }
    } catch {
      setError(t('blog.saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {error && (
        <div className="fixed top-4 left-4 right-4 z-50 p-3 rounded-lg bg-destructive/10 text-destructive text-sm max-w-sm">
          {error}
        </div>
      )}

      <div className="flex w-full h-screen">
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
        <aside className="w-80 border-l overflow-auto p-5 space-y-4 shrink-0">
          <div className="flex gap-2 border-b pb-4">
            <Button variant="outline" size="sm" onClick={() => setPreview((p) => !p)} className="flex-1 gap-2">
              {preview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {preview ? t('blog.editMode') : t('blog.preview')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={saving} className="flex-1 gap-1" title="Draft">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              <span className="hidden sm:inline">{t('blog.draft')}</span>
            </Button>
            <Button size="sm" onClick={() => handleSave(true)} disabled={saving} className="flex-1 gap-1" title="Publish">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              <span className="hidden sm:inline">{t('blog.publish')}</span>
            </Button>
          </div>

          <div className="space-y-2">
            <Label>{t('blog.titleLabel')} *</Label>
            <Input
              placeholder={t('blog.titlePlaceholder')}
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
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
              onValueChange={(v) => set('status', v as CreateArticleRequest['status'])}
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
        </aside>
      </div>
    </div>
  );
}
