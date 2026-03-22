import { useEffect, useState, useCallback } from 'react';
import {
  UserCheck, Search, Loader2, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Star, Briefcase,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getUsers, updateUserRole } from '@/services/adminService';
import type { AdminUserDto } from '@/services/adminService';

/*
 * HR Verification page:
 * - "Pending" tab  → jobseekers (role=0) who applied (UI: users with role=0, promoted via Approve)
 * - "Verified" tab → hr_experts (role=1)  already verified
 * Approve = set role 0→1 | Revoke = set role 1→0
 */

export default function AdminHrVerificationPage() {
  const [allUsers, setAllUsers]   = useState<AdminUserDto[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [tab, setTab]             = useState<'verified' | 'pending'>('verified');
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [actioning, setActioning] = useState<number | null>(null);
  const PAGE_SIZE = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers(page, PAGE_SIZE);
      setAllUsers(data.items ?? []);
      setTotal(data.totalCount ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  // Filter by role (backend enum: 1=JobSeeker, 2=HrExpert, 3=Admin)
  const verified = allUsers.filter((u) => u.role === 2);   // hr_expert
  const pending  = allUsers.filter((u) => u.role === 1);   // jobseeker (potential HRs)

  const list = (tab === 'verified' ? verified : pending).filter((u) => {
    const q = search.toLowerCase();
    return !q || (u.fullName ?? '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const handleApprove = async (user: AdminUserDto) => {
    setActioning(user.id);
    try {
      await updateUserRole(user.id, 2, user.fullName); // 2 = HrExpert
      setAllUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: 2 } : u));
    } finally { setActioning(null); }
  };

  const handleRevoke = async (user: AdminUserDto) => {
    setActioning(user.id);
    try {
      await updateUserRole(user.id, 1, user.fullName); // 1 = JobSeeker
      setAllUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: 1 } : u));
    } finally { setActioning(null); }
  };

  const initials = (name: string | null) =>
    name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b px-6 py-4 flex items-center gap-2">
        <UserCheck className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">HR Verification</h1>
        <span className="ml-1 text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {verified.length} verified
        </span>
      </div>

      {/* Tabs + search */}
      <div className="flex-shrink-0 border-b bg-muted/30 px-6 py-2.5 flex items-center gap-4">
        <div className="flex gap-1">
          {(['verified', 'pending'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                tab === t ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'verified' ? `✓ Verified (${verified.length})` : `⏳ Pending (${pending.length})`}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
            <UserCheck className="h-10 w-10 opacity-20" />
            <p className="text-sm">{tab === 'verified' ? 'No verified HR Experts yet' : 'No pending requests'}</p>
          </div>
        ) : (
          <div className="divide-y">
            {list.map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                {/* Avatar */}
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="text-sm font-semibold bg-violet-100 text-violet-700">
                    {initials(user.fullName)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{user.fullName ?? '—'}</p>
                    {tab === 'verified' && (
                      <Badge className="text-[10px] py-0 bg-green-600 hover:bg-green-600">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                        HR Expert
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Mock stats for verified */}
                {tab === 'verified' && (
                  <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> —</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> — reviews</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex-shrink-0">
                  {tab === 'pending' ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" className="h-8 gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Approve HR Expert?</AlertDialogTitle>
                          <AlertDialogDescription>
                            <strong>{user.fullName ?? user.email}</strong> will be granted HR Expert access and can start accepting resume reviews.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(user)}>
                            Approve
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50 text-xs">
                          <XCircle className="h-3.5 w-3.5" />
                          Revoke
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke HR Expert access?</AlertDialogTitle>
                          <AlertDialogDescription>
                            <strong>{user.fullName ?? user.email}</strong> will lose HR Expert access and be downgraded to a regular job seeker account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => handleRevoke(user)}>
                            Revoke
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
