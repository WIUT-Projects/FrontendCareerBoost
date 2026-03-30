import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users, Search, Loader2, Trash2, ChevronLeft, ChevronRight,
  ShieldCheck, UserCheck, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getUsers, updateUserRole, deleteUser } from '@/services/adminService';
import type { AdminUserDto } from '@/services/adminService';

// Backend Role enum (camelCase): jobSeeker | hrExpert | admin
const ROLE_COLORS: Record<string, string> = {
  jobSeeker: 'bg-sky-100 text-sky-700 border-sky-200',
  hrExpert: 'bg-violet-100 text-violet-700 border-violet-200',
  admin: 'bg-rose-100 text-rose-700 border-rose-200',
};
const ROLE_ICONS: Record<string, typeof User> = { jobSeeker: User, hrExpert: UserCheck, admin: ShieldCheck };

function RoleBadge({ role }: { role: string }) {
  const { t } = useTranslation();
  const Icon = ROLE_ICONS[role] ?? User;
  return (
    <span className={`grid grid-cols-2 items-center justify-center gap-1  px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[role]}`}>
      <Icon className="h-3 w-3 inline mr-1" />
      {t(`admin.roles.${role}`, role)}
    </span>
  );
}

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'jobSeeker' | 'hrExpert' | 'admin'>('all');
  const [updating, setUpdating] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const PAGE_SIZE = 15;

  // Debounce search input (300 ms)
  const handleSearchChange = (value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers(page, PAGE_SIZE, debouncedSearch || undefined, roleFilter !== 'all' ? roleFilter : undefined);
      setUsers(data.items ?? []);
      setTotal(data.totalCount ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => { load(); }, [load]);

  // Role filter resets to page 1
  const handleRoleFilterChange = (v: typeof roleFilter) => {
    setRoleFilter(v);
    setPage(1);
  };

  const filtered = users;

  const handleRoleChange = async (user: AdminUserDto, newRole: string) => {
    setUpdating(user.id);
    try {
      const updated = await updateUserRole(user.id, newRole, user.fullName);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: updated.role } : u)));
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setTotal((t) => t - 1);
    } catch (e) {
      console.error(e);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const initials = (name: string | null) =>
    name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">{t('admin.users')}</h1>
          <span className="ml-1 text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{total}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 border-b bg-muted/30 px-6 py-2.5 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={t('admin.searchPlaceholder')}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => handleRoleFilterChange(v as typeof roleFilter)}>
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue placeholder={t('admin.allRoles')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.allRoles')}</SelectItem>
            <SelectItem value="jobSeeker">{t('admin.roles.jobSeeker')}</SelectItem>
            <SelectItem value="hrExpert">{t('admin.roles.hrExpert')}</SelectItem>
            <SelectItem value="admin">{t('admin.roles.admin')}</SelectItem>
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
                <th className="px-4 py-2.5 font-medium text-muted-foreground">{t('admin.table.user')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">{t('admin.table.email')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">{t('admin.table.role')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">{t('admin.table.joined')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground w-24 text-right">{t('admin.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground text-sm">
                    {t('admin.noUsers')}
                  </td>
                </tr>
              ) : filtered.map((user, i) => (
                <tr key={user.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                          {initials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.fullName ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={user.role}
                      onValueChange={(v) => handleRoleChange(user, v)}
                      disabled={updating === user.id}
                    >
                      <SelectTrigger className="h-7 w-auto text-xs border-0 shadow-none px-1 py-0 focus:ring-0 flex-nowrap gap-1 [&>span]:flex-none">
                        <RoleBadge role={user.role} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jobSeeker">{t('admin.roles.jobSeeker')}</SelectItem>
                        <SelectItem value="hrExpert">{t('admin.roles.hrExpert')}</SelectItem>
                        <SelectItem value="admin">{t('admin.roles.admin')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('admin.deleteTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('admin.deleteDesc', { name: user.fullName ?? user.email })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(user.id)}
                          >
                            {t('admin.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 border-t px-6 py-2.5 flex items-center justify-between text-sm">
          <span className="text-muted-foreground text-xs">
            {t('admin.pagination', { page, totalPages, total })}
          </span>
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
    </div>
  );
}
