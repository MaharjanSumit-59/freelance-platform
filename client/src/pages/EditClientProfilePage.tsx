import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import * as clientsApi from '../api/clients';
import { ApiError } from '../api/client';

export default function EditClientProfilePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [about, setAbout] = useState('');
  const [location, setLocation] = useState('');

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    clientsApi
      .getClientProfile(currentUser.id)
      .then(({ profile }) => {
        if (profile) {
          setCompanyName(profile.companyName || '');
          setAbout(profile.about || '');
          setLocation(profile.location || '');
        }
      })
      .catch(() => setError('Could not load your current profile.'))
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (!currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      await clientsApi.updateClientProfile(currentUser.id, {
        companyName: companyName.trim(),
        about: about.trim(),
        location: location.trim(),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center text-muted">Loading your profile...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-ink">Edit your profile</h1>
          <button
            type="button"
            onClick={() => navigate(`/clients/${currentUser.id}`)}
            className="text-sm text-primary hover:underline"
          >
            View public profile
          </button>
        </div>
        <p className="text-sm text-muted mt-1">This is what freelancers see when they look you up.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Company name</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Inc."
              className="w-full border border-border rounded px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <p className="text-xs text-muted mt-1">Leave blank to show your name instead.</p>
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className="w-full border border-border rounded px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">About</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={5}
              placeholder="What does your company do? What kind of work do you usually hire for?"
              className="w-full border border-border rounded px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {error && (
            <div className="bg-surface border border-warn/30 text-warn rounded-lg text-sm py-3 px-4">{error}</div>
          )}
          {saved && (
            <div className="bg-surface border border-primary/30 text-primary-dark rounded-lg text-sm py-3 px-4">
              Profile saved.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
