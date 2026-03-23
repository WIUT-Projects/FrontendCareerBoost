const API_URL = import.meta.env.VITE_API_URL;

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface TagInfo {
  id: number;
  name: string;
}

export interface ArticleDto {
  id: number;
  authorId: number;
  authorName: string;
  categoryId: number;
  categoryName: string;
  title: string;
  slug: string;
  coverUrl: string;
  body: string;
  status: string;
  viewsCount: number;
  readingTime: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  tags: TagInfo[];
  likesCount: number;
  commentsCount: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

export interface ArticleCategoryDto {
  id: number;
  name: string;
  nameUz?: string;
  nameRu?: string;
  nameEn?: string;
  slug: string;
  createdAt: string;
}

export interface ArticleTagDto {
  id: number;
  name: string;
}

export interface ArticleCommentDto {
  id: number;
  articleId: number;
  userId: number;
  userName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Articles ─────────────────────────────────────────────────────────────────

export async function getArticles(params?: {
  pageIndex?: number;
  pageSize?: number;
  status?: string;
  categoryId?: number;
}): Promise<PaginatedResult<ArticleDto>> {
  const query = new URLSearchParams();
  if (params?.pageIndex !== undefined) query.set('pageIndex', String(params.pageIndex));
  if (params?.pageSize  !== undefined) query.set('pageSize',  String(params.pageSize));
  if (params?.status) query.set('status', params.status);
  if (params?.categoryId) query.set('categoryId', String(params.categoryId));

  const res = await fetch(`${API_URL}/api/articles?${query}`);
  if (!res.ok) throw new Error('Failed to fetch articles');
  return res.json();
}

export async function getArticleBySlug(slug: string): Promise<ArticleDto> {
  const res = await fetch(`${API_URL}/api/articles/by-slug/${slug}`);
  if (!res.ok) throw new Error('Article not found');
  return res.json();
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getArticleCategories(): Promise<PaginatedResult<ArticleCategoryDto>> {
  const res = await fetch(`${API_URL}/api/article-categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export async function getArticleTags(): Promise<PaginatedResult<ArticleTagDto>> {
  const res = await fetch(`${API_URL}/api/article-tags`);
  if (!res.ok) throw new Error('Failed to fetch tags');
  return res.json();
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function getComments(
  articleId: number,
  pageIndex = 1,
  pageSize = 20,
): Promise<PaginatedResult<ArticleCommentDto>> {
  const res = await fetch(
    `${API_URL}/api/article-comments?articleId=${articleId}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
  );
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

export async function postComment(
  token: string,
  articleId: number,
  body: string,
): Promise<ArticleCommentDto> {
  const res = await fetch(`${API_URL}/api/article-comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ articleId, body }),
  });
  if (!res.ok) throw new Error('Failed to post comment');
  return res.json();
}

// ─── Likes ────────────────────────────────────────────────────────────────────

export async function getLikesCount(articleId: number): Promise<number> {
  const res = await fetch(`${API_URL}/api/article-likes/count/${articleId}`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.likesCount as number;
}

export async function likeArticle(token: string, articleId: number): Promise<void> {
  await fetch(`${API_URL}/api/article-likes/${articleId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function unlikeArticle(token: string, articleId: number): Promise<void> {
  await fetch(`${API_URL}/api/article-likes/${articleId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ─── Article CRUD (admin/author) ──────────────────────────────────────────────

export interface CreateArticleRequest {
  categoryId?: number;
  title: string;
  slug?: string;
  coverUrl?: string;
  body?: string;
  status: 'draft' | 'published' | 'archived';
  readingTime?: number;
  tagIds: number[];
}

export interface UpdateArticleRequest extends CreateArticleRequest {}

export async function createArticle(token: string, request: CreateArticleRequest): Promise<ArticleDto> {
  const res = await fetch(`${API_URL}/api/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('Failed to create article');
  return res.json();
}

export async function updateArticle(token: string, id: number, request: UpdateArticleRequest): Promise<ArticleDto> {
  const res = await fetch(`${API_URL}/api/articles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('Failed to update article');
  return res.json();
}

export async function publishArticle(token: string, id: number): Promise<ArticleDto> {
  const res = await fetch(`${API_URL}/api/articles/${id}/publish`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to publish article');
  return res.json();
}

export async function deleteArticle(token: string, id: number): Promise<void> {
  await fetch(`${API_URL}/api/articles/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getArticleById(id: number): Promise<ArticleDto> {
  const res = await fetch(`${API_URL}/api/articles/${id}`);
  if (!res.ok) throw new Error('Article not found');
  return res.json();
}

export async function uploadFile(token: string, file: File, folder = 'articles'): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/api/files/upload?folder=${folder}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.url as string;
}
