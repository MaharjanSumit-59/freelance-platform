import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import * as statsApi from '../api/stats';
import type { PlatformStats } from '../api/stats';

const POPULAR_SKILLS = ['React', 'Figma', 'Node.js', 'Technical Writing', 'React Native', 'SEO'];
const CATEGORIES = ['Web Development', 'Mobile Development', 'Design', 'Writing'];
const CATEGORY_ICON: Record<string, string> = {
  'Web Development': '💻',
  'Mobile Development': '📱',
  Design: '🎨',
  Writing: '✍️',
};

const FEATURES = [
  {
    icon: '📋',
    title: 'Post a job in minutes',
    text: 'Describe the work, set a budget range and deadline, and start receiving proposals right away.',
  },
  {
    icon: '💰',
    title: 'Bids that fit your budget',
    text: 'Freelancers can only bid within your stated budget and timeline, so every proposal is one you can actually accept.',
  },
  {
    icon: '🤝',
    title: 'Milestone-based contracts',
    text: 'Break work into milestones, approve and release payment as each one is delivered — never pay for the whole job upfront.',
  },
  {
    icon: '💬',
    title: 'Built-in messaging',
    text: 'Chat with your client or freelancer on every contract, with unread badges so nothing slips through.',
  },
  {
    icon: '📄',
    title: 'CVs and portfolios',
    text: 'Freelancers can attach a CV to any proposal and build out a portfolio on their profile.',
  },
  {
    icon: '⭐',
    title: 'Verified reviews',
    text: 'Ratings only come from real, completed contracts — no reviews without work actually being done.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    statsApi.getPlatformStats().then(setStats).catch(() => {});
  }, []);

  const hasMeaningfulStats =
    !!stats && (stats.freelancerCount > 0 || stats.openJobCount > 0 || stats.contractsCompleted > 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/jobs?q=${encodeURIComponent(query.trim())}` : '/jobs');
  };

  return (
    <MainLayout>
      <section className="bg-[#0D2E13]">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Find the right freelancer
            <br />
            for the work that matters
          </h1>
          <p className="mt-4 text-white/70 text-lg">
            Post a job, compare proposals, and hire — all in one place.
          </p>

          <form onSubmit={handleSearch} className="mt-8 max-w-2xl mx-auto flex bg-white rounded-full p-1.5 shadow-lg">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try 'React developer' or 'logo design'"
              className="flex-1 px-4 py-2.5 text-sm text-ink focus:outline-none"
            />
            <button
              type="submit"
              className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-primary-dark transition-colors"
            >
              Search
            </button>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {POPULAR_SKILLS.map((skill) => (
              <button
                key={skill}
                onClick={() => navigate(`/jobs?q=${encodeURIComponent(skill)}`)}
                className="text-xs text-white/80 border border-white/25 rounded-full px-3 py-1.5 hover:bg-white/10 transition-colors"
              >
                {skill}
              </button>
            ))}
          </div>

          {hasMeaningfulStats && (
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto border-t border-white/15 pt-8">
              <div>
                <p className="text-2xl font-bold text-white">{stats!.freelancerCount}+</p>
                <p className="text-xs text-white/60 mt-1">Freelancers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats!.openJobCount}+</p>
                <p className="text-xs text-white/60 mt-1">Open jobs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats!.contractsCompleted}+</p>
                <p className="text-xs text-white/60 mt-1">Jobs completed</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-8">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">For clients</p>
          <h2 className="text-2xl font-bold text-ink mt-2">Hire top talent, fast</h2>
          <p className="text-ink/70 mt-3">
            Post a job in minutes, compare proposals side by side, and manage milestones and payments in one dashboard.
          </p>
          <Link
            to="/register"
            className="inline-block mt-5 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary-dark transition-colors"
          >
            Post a job, it's free
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-xl p-8">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">For freelancers</p>
          <h2 className="text-2xl font-bold text-ink mt-2">Find work you'll love</h2>
          <p className="text-ink/70 mt-3">
            Build a profile that shows your track record, filter jobs down to the ones worth your time, and get paid milestone by milestone.
          </p>
          <Link
            to="/jobs"
            className="inline-block mt-5 border border-ink text-ink text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-bg transition-colors"
          >
            Browse jobs
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-ink text-center">Everything you need to work together</h2>
          <p className="text-ink/60 text-center mt-2">No surprises — here's exactly what's built in.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-bg border border-border rounded-xl p-6">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="text-base font-semibold text-ink mt-3">{f.title}</h3>
                <p className="text-sm text-ink/70 mt-1.5">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-ink text-center mb-10">Browse by category</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                to={`/jobs?category=${encodeURIComponent(c)}`}
                className="bg-surface border border-border rounded-xl p-6 text-center hover:border-primary hover:shadow-sm transition-all"
              >
                <span className="text-2xl">{CATEGORY_ICON[c]}</span>
                <p className="text-sm font-semibold text-ink mt-2">{c}</p>
                {stats && (
                  <p className="text-xs text-muted mt-1">
                    {stats.jobsByCategory[c] ?? 0} open job{stats.jobsByCategory[c] === 1 ? '' : 's'}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-ink text-center mb-10">How FreelanceHub works</h2>
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { step: '1', label: 'Post a job' },
              { step: '2', label: 'Receive proposals' },
              { step: '3', label: 'Hire & create contract' },
              { step: '4', label: 'Work, milestone by milestone' },
              { step: '5', label: 'Pay & leave a review' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary-light text-primary-dark font-bold flex items-center justify-center mx-auto">
                  {s.step}
                </div>
                <p className="text-sm text-ink mt-3">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0D2E13]">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="text-white/70 mt-2">Join as a client or freelancer — it only takes a minute.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-primary-dark transition-colors"
            >
              Create a free account
            </Link>
            <Link
              to="/jobs"
              className="border border-white/30 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-white/10 transition-colors"
            >
              Browse open jobs
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}