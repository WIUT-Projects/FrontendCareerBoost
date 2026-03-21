import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { getSavedJobs, unsaveJob, type JobSavedResponse } from '@/services/jobService';
import { MapPin, Bookmark, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

export default function SavedJobs() {
  const { session } = useAuth();
  const token = session?.access_token ?? '';

  const [savedJobs, setSavedJobs] = useState<JobSavedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    getSavedJobs(token, 1, 50)
      .then((res) => setSavedJobs(res.items))
      .catch(() => toast.error('Failed to load saved jobs'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleRemove(jobId: number) {
    setRemoving(jobId);
    try {
      await unsaveJob(token, jobId);
      setSavedJobs((prev) => prev.filter((s) => s.jobId !== jobId));
      toast.success('Removed from saved jobs');
    } catch {
      toast.error('Failed to remove saved job');
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Saved Jobs</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">You haven't saved any jobs yet.</p>
          <Button asChild variant="link" className="mt-2">
            <Link to="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((saved) => (
            <Card key={saved.id}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/jobs/${saved.jobId}`}
                    className="font-semibold hover:underline line-clamp-1"
                  >
                    {saved.jobTitle ?? `Job #${saved.jobId}`}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    {saved.companyName && <span>{saved.companyName}</span>}
                    {saved.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {saved.location}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(saved.jobId)}
                  disabled={removing === saved.jobId}
                >
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
