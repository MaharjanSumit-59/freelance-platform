import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import JobCard from '../components/JobCard';
import * as jobsApi from '../api/jobs';
import type { Job, ExperienceLevel, JobType } from '../types';

const CATEGORIES = ['Web Development', 'Mobile Development', 'Design', 'Writing'];

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4 border-b border-border last:border-0">
      <p className="text-sm font-semibold text-ink mb-3">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export default function JobsBrowsePage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState<string | null>(searchParams.get('category'));
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [jobType, setJobType] = useState<JobType | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'budget'>('newest');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    // Debounce the free-text search slightly so we're not firing a request per keystroke;
    // other filters (checkboxes/select) apply immediately since they change less often.
    const handle = setTimeout(() => {
      jobsApi
        .listJobs({
          search: search.trim() || undefined,
          category: category ?? undefined,
          experienceLevel: experience ?? undefined,
          jobType: jobType ?? undefined,
          sort: sortBy,
        })
        .then(setJobs)
        .catch(() => setError('Could not load jobs. Is the API running?'))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [search, category, experience, jobType, sortBy]);

  const clearFilters = () => {
    setCategory(null);
    setExperience(null);
    setJobType(null);
  };

  const activeFilterCount = [category, experience, jobType].filter(Boolean).length;
  const [showFilters, setShowFilters] = useState(false);

  return (
    <MainLayout>
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl font-bold text-ink">Find work</h1>
          <div className="mt-4 relative max-w-xl">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs by title or skill..."
              className="w-full border border-border rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">🔍</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 grid md:grid-cols-4 gap-5 md:gap-8">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className="md:hidden flex items-center justify-between w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm font-medium text-ink"
        >
          <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
          <span className="text-muted">{showFilters ? 'Hide ▲' : 'Show ▼'}</span>
        </button>

        <aside className={`md:col-span-1 ${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className="bg-surface border border-border rounded-lg p-5">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-semibold text-ink">Filters</p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                  Clear all
                </button>
              )}
            </div>

            <FilterSection title="Category">
              {CATEGORIES.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm text-ink/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={category === c}
                    onChange={() => setCategory(category === c ? null : c)}
                    className="accent-primary"
                  />
                  {c}
                </label>
              ))}
            </FilterSection>

            <FilterSection title="Experience level">
              {(['entry', 'intermediate', 'expert'] as ExperienceLevel[]).map((lvl) => (
                <label key={lvl} className="flex items-center gap-2 text-sm text-ink/80 capitalize cursor-pointer">
                  <input
                    type="checkbox"
                    checked={experience === lvl}
                    onChange={() => setExperience(experience === lvl ? null : lvl)}
                    className="accent-primary"
                  />
                  {lvl}
                </label>
              ))}
            </FilterSection>

            <FilterSection title="Job type">
              {(['fixed', 'hourly'] as JobType[]).map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm text-ink/80 capitalize cursor-pointer">
                  <input
                    type="checkbox"
                    checked={jobType === t}
                    onChange={() => setJobType(jobType === t ? null : t)}
                    className="accent-primary"
                  />
                  {t === 'fixed' ? 'Fixed price' : 'Hourly'}
                </label>
              ))}
            </FilterSection>
          </div>
        </aside>

        <section className="md:col-span-3">
          <div className="flex justify-between items-center gap-3 mb-4">
            <p className="text-sm text-muted">
              {!loading && (
                <>
                  <span className="font-semibold text-ink">{jobs.length}</span> jobs found
                </>
              )}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'budget')}
              className="text-sm border border-border rounded px-3 py-1.5 bg-surface"
            >
              <option value="newest">Newest first</option>
              <option value="budget">Highest budget</option>
            </select>
          </div>

          {error && (
            <div className="bg-surface border border-warn/30 text-warn rounded-lg text-sm py-4 px-4 mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <div className="bg-surface border border-border rounded-lg text-muted text-sm py-16 text-center">
                Loading jobs...
              </div>
            ) : (
              <>
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
                {jobs.length === 0 && !error && (
                  <div className="bg-surface border border-border rounded-lg text-muted text-sm py-16 text-center">
                    No jobs match your filters.{' '}
                    <button onClick={clearFilters} className="text-primary hover:underline">
                      Clear filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
