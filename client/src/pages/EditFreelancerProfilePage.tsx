import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import * as freelancersApi from '../api/freelancers';
import { ApiError } from '../api/client';
import type { PortfolioItem } from '../types';

export default function EditFreelancerProfilePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [about, setAbout] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    freelancersApi
      .getFreelancerProfile(currentUser.id)
      .then(({ profile }) => {
        if (profile) {
          setTitle(profile.title || '');
          setAbout(profile.about || '');
          setHourlyRate(profile.hourlyRate ? String(profile.hourlyRate) : '');
          setSkillsInput((profile.skills || []).join(', '));
          setPortfolio(profile.portfolio || []);
        }
      })
      .catch(() => setError('Could not load your current profile.'))
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (!currentUser) return null;

  const updatePortfolioItem = (index: number, field: keyof PortfolioItem, value: string) => {
    setPortfolio((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const addPortfolioItem = () => {
    setPortfolio((prev) => [...prev, { title: '', description: '', imageUrl: '' }]);
  };

  const removePortfolioItem = (index: number) => {
    setPortfolio((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    const rate = Number(hourlyRate);
    if (!title.trim()) {
      setError('Add a professional title.');
      return;
    }
    if (!Number.isFinite(rate) || rate <= 0) {
      setError('Enter a valid hourly rate.');
      return;
    }
    const skills = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
    const cleanPortfolio = portfolio.filter((p) => p.title.trim() || p.description.trim());

    setSaving(true);
    try {
      await freelancersApi.updateFreelancerProfile(currentUser.id, {
        title: title.trim(),
        about: about.trim(),
        hourlyRate: rate,
        skills,
        portfolio: cleanPortfolio,
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
            onClick={() => navigate(`/freelancers/${currentUser.id}`)}
            className="text-sm text-primary hover:underline"
          >
            View public profile
          </button>
        </div>
        <p className="text-sm text-muted mt-1">This is what clients see when they look you up.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Professional title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Full-Stack Developer | React & Node"
              className="w-full border border-border rounded px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">About you</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={5}
              placeholder="Summarize your experience, specialties, and what you're great at."
              className="w-full border border-border rounded px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Hourly rate ($/hr)</label>
            <input
              required
              type="number"
              min="1"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="w-full border border-border rounded px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Skills</label>
            <input
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="React, TypeScript, Node.js (comma-separated)"
              className="w-full border border-border rounded px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-ink">Portfolio</label>
              <button type="button" onClick={addPortfolioItem} className="text-xs text-primary hover:underline">
                + Add item
              </button>
            </div>
            <div className="space-y-3">
              {portfolio.map((item, i) => (
                <div key={i} className="border border-border rounded-lg p-3 space-y-2 bg-surface">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      value={item.title}
                      onChange={(e) => updatePortfolioItem(i, 'title', e.target.value)}
                      placeholder="Project title"
                      className="flex-1 border border-border rounded px-2.5 py-1.5 text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      type="button"
                      onClick={() => removePortfolioItem(i)}
                      className="text-xs text-warn hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={item.description}
                    onChange={(e) => updatePortfolioItem(i, 'description', e.target.value)}
                    placeholder="What was this project about?"
                    rows={2}
                    className="w-full border border-border rounded px-2.5 py-1.5 text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
              {portfolio.length === 0 && (
                <p className="text-xs text-muted">No portfolio items yet. Add a project to show your work.</p>
              )}
            </div>
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
