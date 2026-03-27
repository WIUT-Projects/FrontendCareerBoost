const API_URL = import.meta.env.VITE_API_URL;

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface JobListingResponse {
  id: number;
  postedBy: number;
  postedByName: string | null;
  title: string;
  companyName: string | null;
  companyLogoUrl: string | null;
  description: string | null;
  requiredSkills: string | null;
  location: string | null;
  employmentType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  experienceYears: number | null;
  status: 'draft' | 'active' | 'closed' | number | null;
  viewsCount: number;
  applicationsCount: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateJobListingRequest {
  title: string;
  companyName?: string;
  companyLogoUrl?: string;
  description?: string;
  requiredSkills?: string;
  location?: string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  experienceYears?: number;
  status?: string;
  expiresAt?: string;
}

export interface UpdateJobListingRequest extends CreateJobListingRequest {}

export interface JobApplicationResponse {
  id: number;
  jobId: number;
  jobTitle: string | null;
  applicantId: number;
  applicantName: string | null;
  resumeId: number | null;
  resumeFileUrl: string | null;
  coverLetter: string | null;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | number | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateJobApplicationRequest {
  jobId: number;
  resumeId?: number;
  resumeFileUrl?: string;
  coverLetter?: string;
}

export interface JobSavedResponse {
  id: number;
  userId: number;
  jobId: number;
  jobTitle: string | null;
  companyName: string | null;
  location: string | null;
  status: 'draft' | 'active' | 'closed' | null;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

// ─── File Upload ───────────────────────────────────────────────────────────────

// POST /api/files/upload?folder=resumes
// Used in: JobDetail.tsx (upload PDF/Word resume before submitting application)
export async function uploadJobResume(token: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/api/files/upload?folder=resumes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload resume file');
  const data: { url: string } = await res.json();
  return data.url;
}

// ─── Job Listings ──────────────────────────────────────────────────────────────

// GET /api/job-listings
// Used in: Jobs.tsx (browse active listings with filters), HrJobListings.tsx (manage own/all listings), HrApplicants.tsx (populate job dropdown)
export async function getJobListings(params?: {
  pageIndex?: number;
  pageSize?: number;
  status?: 'draft' | 'active' | 'closed';
  location?: string;
  employmentType?: string;
}): Promise<PagedResult<JobListingResponse>> {
  const query = new URLSearchParams();
  if (params?.pageIndex) query.set('pageIndex', String(params.pageIndex));
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));
  if (params?.status) query.set('status', params.status);
  if (params?.location) query.set('location', params.location);
  if (params?.employmentType) query.set('employmentType', params.employmentType);

  const res = await fetch(`${API_URL}/api/job-listings?${query}`);
  if (!res.ok) throw new Error('Failed to fetch job listings');
  return res.json();
}

// GET /api/job-listings/{id}
// Used in: JobDetail.tsx (show full job details, salary, description, required skills)
export async function getJobListingById(id: number): Promise<JobListingResponse> {
  const res = await fetch(`${API_URL}/api/job-listings/${id}`);
  if (!res.ok) throw new Error('Job listing not found');
  return res.json();
}

// POST /api/job-listings
// Used in: HrJobListings.tsx (HR/Admin creates a new job listing via dialog form)
export async function createJobListing(
  token: string,
  request: CreateJobListingRequest,
): Promise<JobListingResponse> {
  const res = await fetch(`${API_URL}/api/job-listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('Failed to create job listing');
  return res.json();
}

// PUT /api/job-listings/{id}
// Used in: HrJobListings.tsx (HR/Admin edits an existing listing — all fields replaced)
export async function updateJobListing(
  token: string,
  id: number,
  request: UpdateJobListingRequest,
): Promise<JobListingResponse> {
  const res = await fetch(`${API_URL}/api/job-listings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('Failed to update job listing');
  return res.json();
}

// DELETE /api/job-listings/{id}
// Used in: HrJobListings.tsx (HR/Admin soft-deletes a listing; returns 409 if it has active applications)
export async function deleteJobListing(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/job-listings/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? 'Failed to delete job listing');
  }
}

// ─── Job Applications ──────────────────────────────────────────────────────────
//
// NOT IMPLEMENTED: GET /api/job-applications/{id}
// Reason: No need to fetch a single application by ID on the frontend.
//   We always work with paginated lists (by-applicant or by-job).
//   If a detail view is ever needed, add getApplicationById(token, id) here.

// GET /api/job-applications/by-applicant
// Used in: Applications.tsx (jobseeker tracks all their own applications + status),
//          JobDetail.tsx (check if the current user has already applied to this job)
export async function getApplicationsByApplicant(
  token: string,
  applicantId: number,
  pageIndex = 1,
  pageSize = 20,
): Promise<PagedResult<JobApplicationResponse>> {
  const res = await fetch(
    `${API_URL}/api/job-applications/by-applicant?applicantId=${applicantId}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

// GET /api/job-applications/by-job
// Used in: HrApplicants.tsx (HR views all applicants for a selected job listing)
export async function getApplicationsByJob(
  token: string,
  jobId: number,
  pageIndex = 1,
  pageSize = 20,
): Promise<PagedResult<JobApplicationResponse>> {
  const res = await fetch(
    `${API_URL}/api/job-applications/by-job?jobId=${jobId}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error('Failed to fetch applications for job');
  return res.json();
}

// POST /api/job-applications
// Used in: JobDetail.tsx (jobseeker submits application; returns 409 if already applied)
export async function createApplication(
  token: string,
  request: CreateJobApplicationRequest,
): Promise<JobApplicationResponse> {
  const res = await fetch(`${API_URL}/api/job-applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
  if (res.status === 409) throw new Error('already_applied');
  if (!res.ok) throw new Error('Failed to submit application');
  return res.json();
}

// PATCH /api/job-applications/{id}/status
// Used in: HrApplicants.tsx (HR moves application through pipeline: pending→reviewed→accepted/rejected)
export async function updateApplicationStatus(
  token: string,
  id: number,
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected',
): Promise<JobApplicationResponse> {
  const res = await fetch(`${API_URL}/api/job-applications/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update application status');
  return res.json();
}

// DELETE /api/job-applications/{id}
// Used in: Applications.tsx (jobseeker withdraws a pending application; returns 403 if not the applicant)
export async function withdrawApplication(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/job-applications/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to withdraw application');
}

// ─── Saved Jobs ────────────────────────────────────────────────────────────────

// GET /api/job-saved
// Used in: SavedJobs.tsx (list all saved jobs), Jobs.tsx (highlight which cards are saved),
//          JobDetail.tsx (check if this specific job is already saved)
export async function getSavedJobs(
  token: string,
  pageIndex = 1,
  pageSize = 10,
): Promise<PagedResult<JobSavedResponse>> {
  const res = await fetch(
    `${API_URL}/api/job-saved?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error('Failed to fetch saved jobs');
  return res.json();
}

// POST /api/job-saved/{jobId}
// Used in: Jobs.tsx (save from job card), JobDetail.tsx (save from detail page; returns 409 if already saved)
export async function saveJob(token: string, jobId: number): Promise<JobSavedResponse> {
  const res = await fetch(`${API_URL}/api/job-saved/${jobId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 409) throw new Error('already_saved');
  if (!res.ok) throw new Error('Failed to save job');
  return res.json();
}

// DELETE /api/job-saved/{jobId}
// Used in: Jobs.tsx (unsave from card), JobDetail.tsx (toggle unsave button), SavedJobs.tsx (remove from saved list)
export async function unsaveJob(token: string, jobId: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/job-saved/${jobId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to unsave job');
}
