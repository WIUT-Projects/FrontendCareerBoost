import { useEffect, useState, useCallback } from 'react';
import {
  UserCheck, Search, Loader2, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Star, Briefcase, AlertCircle, MessageCircle, Calendar,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { resolveMediaUrl } from '@/lib/utils';
import { getUsers, updateHrVerificationStatus } from '@/services/adminService';
import type { AdminUserDto } from '@/services/adminService';
import { getHrExpertById } from '@/services/hrExpertService';
import type { HrExpertProfileResponse } from '@/services/hrExpertService';

/*
 * HR Verification page:
 * - "Pending" tab  → jobseekers (role=0) who applied (UI: users with role=0, promoted via Approve)
 * - "Verified" tab → hr_experts (role=1)  already verified
 * Approve = set role 0→1 | Revoke = set role 1→0
 */

export default function AdminHrVerificationPage() {
  const { t } = useTranslation();
  const [allUsers, setAllUsers]   = useState<AdminUserDto[]>([]);
  const [hrProfiles, setHrProfiles] = useState<Record<number, HrExpertProfileResponse | null>>({});
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [tab, setTab]             = useState<'verified' | 'pending'>('verified');
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [actioning, setActioning] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserDto | null>(null);
  const PAGE_SIZE = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers(page, PAGE_SIZE, '', '2');
      setAllUsers(data.items ?? []);
      setTotal(data.totalCount ?? 0);

      // Load HR profile data for HR experts (role=2) to show isVerified status
      const pendingUsers = data.items ?? [];
      const profiles: Record<number, HrExpertProfileResponse | null> = {};

      for (const user of pendingUsers) {
        try {
          const profile = await getHrExpertById(user.id);
          profiles[user.id] = profile;
        } catch {
          profiles[user.id] = null;
        }
      }
      setHrProfiles(profiles);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  // Filter by verification status
  // Pending: HrExperts with isVerified=false (need admin approval)
  const pending = allUsers.filter((u) => hrProfiles[u.id] && !hrProfiles[u.id]?.isVerified);

  // Verified: HrExperts with isVerified=true (already approved)
  const verified = allUsers.filter((u) => hrProfiles[u.id] && hrProfiles[u.id]?.isVerified);

  const list = (tab === 'verified' ? verified : pending).filter((u) => {
    const q = search.toLowerCase();
    return !q || (u.fullName ?? '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleApprove = async (user: AdminUserDto) => {
    setActioning(user.id);
    try {
      await updateHrVerificationStatus(user.id, true);
      setHrProfiles((prev) => ({
        ...prev,
        [user.id]: prev[user.id] ? { ...prev[user.id]!, isVerified: true } : null,
      }));
    } catch (e) {
      console.error(e);
    } finally { setActioning(null); }
  };

  const handleRevoke = async (user: AdminUserDto) => {
    setActioning(user.id);
    try {
      await updateHrVerificationStatus(user.id, false);
      setHrProfiles((prev) => ({
        ...prev,
        [user.id]: prev[user.id] ? { ...prev[user.id]!, isVerified: false } : null,
      }));
    } catch (e) {
      console.error(e);
    } finally { setActioning(null); }
  };

  const initials = (name: string | null) =>
    name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b px-6 py-4 flex items-center gap-2">
        <UserCheck className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">{t('admin.hrVerification.title')}</h1>
        <span className="ml-1 text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {t('admin.hrVerification.verifiedCount', { count: verified.length })}
        </span>
      </div>

      {/* Tabs + search */}
      <div className="flex-shrink-0 border-b bg-muted/30 px-6 py-2.5 flex items-center gap-4">
        <div className="flex gap-1">
          {(['verified', 'pending'] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                tab === tabKey ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tabKey === 'verified'
                ? t('admin.hrVerification.tabVerified', { count: verified.length })
                : t('admin.hrVerification.tabPending', { count: pending.length })}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder={t('admin.hrVerification.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
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
            <p className="text-sm">{tab === 'verified' ? t('admin.hrVerification.noVerified') : t('admin.hrVerification.noPending')}</p>
          </div>
        ) : (
          <div className="divide-y">
            {list.map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center gap-4 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
                {/* Avatar */}
                <Avatar className="h-10 w-10 flex-shrink-0">
                  {hrProfiles[user.id]?.avatarUrl && (
                    <AvatarImage
                      src={resolveMediaUrl(hrProfiles[user.id]?.avatarUrl || '')}
                      alt={user.fullName || 'User'}
                    />
                  )}
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
                        {t('admin.hrVerification.hrExpert')}
                      </Badge>
                    )}
                    {tab === 'pending' && hrProfiles[user.id]?.isVerified === false && (
                      <Badge className="text-[10px] py-0 bg-amber-100 text-amber-700 border-amber-200" variant="outline">
                        <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                        {t('admin.hrVerification.notVerified')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  {tab === 'pending' && hrProfiles[user.id] && (
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      {hrProfiles[user.id]?.headline && <p>{hrProfiles[user.id]?.headline}</p>}
                      {hrProfiles[user.id]?.yearsExp && <p>{hrProfiles[user.id]?.yearsExp} {t('admin.hrVerification.yearsExp')}</p>}
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {t('admin.hrVerification.joined', { date: new Date(user.createdAt).toLocaleDateString() })}
                  </p>
                </div>

                {/* Stats for verified */}
                {tab === 'verified' && (
                  <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> —</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> — {t('admin.hrVerification.reviews')}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex-shrink-0">
                  {tab === 'pending' ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" className="h-8 gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t('admin.hrVerification.approve')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('admin.hrVerification.approveTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('admin.hrVerification.approveDesc', { name: user.fullName ?? user.email })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
                          <AlertDialogAction className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(user)}>
                            {t('admin.hrVerification.approve')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50 text-xs">
                          <XCircle className="h-3.5 w-3.5" />
                          {t('admin.hrVerification.revoke')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('admin.hrVerification.revokeTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('admin.hrVerification.revokeDesc', { name: user.fullName ?? user.email })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => handleRevoke(user)}>
                            {t('admin.hrVerification.revoke')}
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

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex-shrink-0 border-t px-6 py-3 flex items-center justify-between bg-muted/30">
          <div className="text-xs text-muted-foreground">
            {t('admin.hrVerification.page', { current: page, total: totalPages })}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('admin.hrVerification.details')}</DialogTitle>
          </DialogHeader>

          {selectedUser && hrProfiles[selectedUser.id] && (
            <div className="space-y-5">
              {/* Avatar + Basic Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 flex-shrink-0">
                  {hrProfiles[selectedUser.id]?.avatarUrl && (
                    <AvatarImage
                      src={resolveMediaUrl(hrProfiles[selectedUser.id]?.avatarUrl || '')}
                      alt={selectedUser.fullName || 'User'}
                    />
                  )}
                  <AvatarFallback className="text-lg font-semibold bg-violet-100 text-violet-700">
                    {initials(selectedUser.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{selectedUser.fullName ?? '—'}</h3>
                  <p className="text-sm text-muted-foreground break-all">{selectedUser.email}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Verification Status Badge */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-muted">
                {hrProfiles[selectedUser.id]?.isVerified ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Status</p>
                      <p className="text-sm font-semibold text-green-600">{t('admin.hrVerification.verified')}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Status</p>
                      <p className="text-sm font-semibold text-amber-600">{t('admin.hrVerification.notVerified')}</p>
                    </div>
                  </>
                )}
              </div>

              {/* User Details Grid */}
              <div className="grid grid-cols-2 gap-3 border-t pt-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Full Name</p>
                  <p className="text-sm font-medium">{selectedUser.fullName ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Email</p>
                  <p className="text-sm font-medium break-all">{selectedUser.email}</p>
                </div>
              </div>

              {/* HR Expert Details - Grid Layout */}
              {(hrProfiles[selectedUser.id]?.headline ||
                hrProfiles[selectedUser.id]?.yearsExp ||
                hrProfiles[selectedUser.id]?.specializations ||
                hrProfiles[selectedUser.id]?.reviewPriceUzs ||
                hrProfiles[selectedUser.id]?.avgRating ||
                hrProfiles[selectedUser.id]?.totalReviews) && (
                <div className="border-t pt-3">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">HR Profile</h4>

                  <div className="grid grid-cols-3 gap-2">
                    {hrProfiles[selectedUser.id]?.headline && (
                      <div className="col-span-3">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-0.5">Headline</p>
                        <p className="text-xs text-foreground line-clamp-2">{hrProfiles[selectedUser.id]?.headline}</p>
                      </div>
                    )}

                    {hrProfiles[selectedUser.id]?.yearsExp && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-0.5">Exp.</p>
                        <p className="text-xs text-foreground">{hrProfiles[selectedUser.id]?.yearsExp}y</p>
                      </div>
                    )}

                    {hrProfiles[selectedUser.id]?.reviewPriceUzs && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-0.5">Price</p>
                        <p className="text-xs text-foreground">{(hrProfiles[selectedUser.id]?.reviewPriceUzs / 1000).toFixed(0)}k</p>
                      </div>
                    )}

                    {hrProfiles[selectedUser.id]?.avgRating && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-0.5">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <p className="text-xs text-foreground">{hrProfiles[selectedUser.id]?.avgRating?.toFixed(1)}</p>
                        </div>
                      </div>
                    )}

                    {hrProfiles[selectedUser.id]?.totalReviews !== undefined && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-0.5">Reviews</p>
                        <p className="text-xs text-foreground">{hrProfiles[selectedUser.id]?.totalReviews}</p>
                      </div>
                    )}

                    {hrProfiles[selectedUser.id]?.specializations && (
                      <div className="col-span-3">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-0.5">Skills</p>
                        <p className="text-xs text-foreground line-clamp-2">{hrProfiles[selectedUser.id]?.specializations}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-9 gap-2"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-chat', {
                      detail: {
                        partnerId: selectedUser.id,
                        partnerName: selectedUser.fullName,
                        partnerAvatar: hrProfiles[selectedUser.id]?.avatarUrl ?? null,
                      },
                    }));
                    setSelectedUser(null);
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('admin.hrVerification.message')}
                </Button>

                {tab === 'pending' ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" className="flex-1 h-9 gap-2 bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle2 className="h-4 w-4" />
                        {t('admin.hrVerification.approve')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('admin.hrVerification.approveTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('admin.hrVerification.approveDesc', { name: selectedUser.fullName ?? selectedUser.email })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
                        <AlertDialogAction className="bg-green-600 hover:bg-green-700" onClick={() => {
                          handleApprove(selectedUser);
                          setSelectedUser(null);
                        }}>
                          {t('admin.hrVerification.approve')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex-1 h-9 gap-2 text-rose-600 border-rose-200 hover:bg-rose-50">
                        <XCircle className="h-4 w-4" />
                        {t('admin.hrVerification.revoke')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('admin.hrVerification.revokeTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('admin.hrVerification.revokeDesc', { name: selectedUser.fullName ?? selectedUser.email })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => {
                          handleRevoke(selectedUser);
                          setSelectedUser(null);
                        }}>
                          {t('admin.hrVerification.revoke')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
