import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import * as clientsApi from '../api/clients';
import type { ClientProfileResponse } from '../api/clients';
import { useAuth } from '../context/AuthContext';

export default function ClientProfilePage() {
  const { clientId } = useParams();
  const { currentUser } = useAuth();
  const [data, setData] = useState<ClientProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    setNotFound(false);
    clientsApi
      .getClientProfile(clientId)
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [clientId]);

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
          <p className="text-muted">Client not found.</p>
          <Link to="/jobs" className="text-primary underline">Back to jobs</Link>
        </div>
      </MainLayout>
    );
  }

  const { user, profile, stats } = data;

  return (
    <MainLayout>
      <div className="bg-surface border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start gap-4 sm:gap-5 justify-between">
          <div className="flex items-start gap-4 sm:gap-5 min-w-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-light flex items-center justify-center text-xl sm:text-2xl font-semibold text-primary-dark flex-shrink-0">
              {user.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-ink break-words">{profile?.companyName || user.name}</h1>
              <p className="text-ink/70 mt-0.5">{user.name}</p>
              {profile?.location && <p className="text-sm text-muted mt-1">{profile.location}</p>}
              <p className="text-xs text-muted mt-1">Member since {new Date(user.createdAt).getFullYear()}</p>
            </div>
          </div>
          {currentUser?.id === user.id && (
            <Link
              to="/client/profile/edit"
              className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary-dark transition-colors shrink-0"
            >
              Edit profile
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {profile?.about ? (
            <div>
              <h2 className="text-sm font-semibold text-ink uppercase tracking-wide mb-3">About</h2>
              <p className="text-ink/80 leading-relaxed">{profile.about}</p>
            </div>
          ) : (
            <p className="text-sm text-muted">This client hasn't added a description yet.</p>
          )}
        </div>

        <aside className="md:col-span-1">
          <div className="bg-surface border border-border rounded-lg p-5 md:sticky md:top-20 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted">Jobs posted</p>
                <p className="text-ink font-semibold">{stats.jobsPosted}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Contracts completed</p>
                <p className="text-ink font-semibold">{stats.contractsCompleted}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
