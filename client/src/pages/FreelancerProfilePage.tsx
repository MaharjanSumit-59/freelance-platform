import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import * as freelancersApi from '../api/freelancers';
import type { FreelancerProfileResponse } from '../api/freelancers';
import { useAuth } from '../context/AuthContext';

export default function FreelancerProfilePage() {
  const { freelancerId } = useParams();
  const { currentUser } = useAuth();
  const [data, setData] = useState<FreelancerProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!freelancerId) return;
    setLoading(true);
    setNotFound(false);
    freelancersApi
      .getFreelancerProfile(freelancerId)
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [freelancerId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center text-muted">Loading profile...</div>
      </MainLayout>
    );
  }

  if (notFound || !data) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-muted">Freelancer not found.</p>
          <Link to="/jobs" className="text-primary underline">Back to jobs</Link>
        </div>
      </MainLayout>
    );
  }

  const { user, profile, stats, reviews } = data;

  return (
    <MainLayout>
      <div className="bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start gap-4 sm:gap-5 justify-between">
          <div className="flex items-start gap-4 sm:gap-5 min-w-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-light flex items-center justify-center text-xl sm:text-2xl font-semibold text-primary-dark flex-shrink-0">
              {user.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-ink break-words">{user.name}</h1>
              <p className="text-ink/70 mt-0.5">{profile?.title || 'Freelancer'}</p>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <span className="text-star">★</span>
                <span className="font-semibold text-ink">{stats.rating.toFixed(1)}</span>
                <span className="text-muted">({stats.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
          {currentUser?.id === user.id && (
            <Link
              to="/freelancer/profile/edit"
              className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary-dark transition-colors shrink-0"
            >
              Edit profile
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {profile?.about && (
            <div>
              <h2 className="text-sm font-semibold text-ink uppercase tracking-wide mb-3">About</h2>
              <p className="text-ink/80 leading-relaxed">{profile.about}</p>
            </div>
          )}

          {profile && profile.skills.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-ink uppercase tracking-wide mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span key={s} className="text-xs bg-bg border border-border text-ink px-3 py-1.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile && profile.portfolio.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-ink uppercase tracking-wide mb-3">Portfolio</h2>
              <div className="grid grid-cols-2 gap-4">
                {profile.portfolio.map((p, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 bg-surface">
                    <div className="aspect-video bg-bg rounded mb-3" />
                    <p className="font-medium text-sm text-ink">{p.title}</p>
                    <p className="text-xs text-ink/60 mt-1">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviews.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-ink uppercase tracking-wide mb-3">Reviews</h2>
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="border border-border rounded-lg p-4 bg-surface">
                    <div className="flex gap-4 text-xs text-muted">
                      <span>Communication <span className="text-ink font-medium">{r.communication}/5</span></span>
                      <span>Quality <span className="text-ink font-medium">{r.quality}/5</span></span>
                      <span>Timeliness <span className="text-ink font-medium">{r.timeliness}/5</span></span>
                    </div>
                    {r.comment && <p className="text-sm text-ink/80 mt-2">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="md:col-span-1">
          <div className="bg-surface border border-border rounded-lg p-5 md:sticky md:top-20 space-y-4">
            <div>
              <p className="text-xs text-muted">Hourly rate</p>
              <p className="text-xl font-bold text-ink">${profile?.hourlyRate ?? 0}/hr</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm border-t border-border pt-4">
              <div>
                <p className="text-xs text-muted">Jobs completed</p>
                <p className="text-ink font-semibold">{stats.jobsCompleted}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Total earned</p>
                <p className="text-ink font-semibold">${(stats.totalEarned / 1000).toFixed(1)}K</p>
              </div>
              <div>
                <p className="text-xs text-muted">Rating</p>
                <p className="text-ink font-semibold">⭐ {stats.rating.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Reviews</p>
                <p className="text-ink font-semibold">{stats.reviewCount}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
